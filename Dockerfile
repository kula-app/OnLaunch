# syntax=docker/dockerfile:1

# ---- Download Base ----
FROM alpine AS dl
ARG TARGETARCH
WORKDIR /tmp

RUN apk add --no-cache curl unzip

# ---- Prisma CLI ----
FROM node:22.14.0-alpine AS prisma
WORKDIR /tmp

# Install tooling
RUN apk add --no-cache jq

# Setup the environment
COPY .yarnrc.yml .
COPY .yarn/releases .yarn/releases

# Node Dependency Management
COPY package.json .
COPY yarn.lock .

# Get the version of prisma and save it to a file to be used in the next stage
RUN yarn info --json prisma | jq -r '.children.Version' > .prisma-version

# ---- Base ----
FROM node:22.14.0-alpine AS base

# Set Working Directory
WORKDIR /home/node/app

# Setup the environment
COPY .yarnrc.yml .
COPY .yarn/releases .yarn/releases

# Node Dependency Management
COPY package.json .
COPY yarn.lock .

# Files required for compilation
COPY next.config.js .
COPY tsconfig.json .
COPY next-swagger-doc.json .

# ---- Dependencies ----
FROM base AS dependencies_development
# install all node_modules, including 'devDependencies'
RUN \
  --mount=type=cache,target=/root/.yarn/cache \
  yarn workspaces focus

# Copy the prisma schema to generate the client
COPY prisma ./prisma

# Generate the prisma client
RUN yarn prisma generate

# ---- Build Setup ----
FROM base AS build
# Copy resources required for the build process.
# Caching depends on previous layers, therefore a changed layer will invalidate all following layers.
# Order the layers from least-to-change to frequent-to-change.

COPY sentry.client.config.ts .
COPY sentry.edge.config.ts .
COPY sentry.server.config.ts .

COPY postcss.config.js .
COPY tailwind.config.js .

COPY public ./public
COPY src ./src

# copy node_modules with all build tools included
COPY --from=dependencies_development /home/node/app/prisma ./prisma
COPY --from=dependencies_development /home/node/app/node_modules ./node_modules

# build the server
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# ---- Download: sentry-cli --
FROM dl AS dl-sentry-cli
# renovate: datasource=github-releases depName=getsentry/sentry-cli
ARG SENTRY_CLI_VERSION="2.43.0"
RUN <<EOT ash
if [ "${TARGETARCH}" = "amd64" ]; then
  curl -L --fail https://github.com/getsentry/sentry-cli/releases/download/${SENTRY_CLI_VERSION}/sentry-cli-linux-x64-${SENTRY_CLI_VERSION}.tgz -o sentry-cli.tar.gz
elif [ "${TARGETARCH}" = "arm64" ]; then
  curl -L --fail https://github.com/getsentry/sentry-cli/releases/download/${SENTRY_CLI_VERSION}/sentry-cli-linux-arm64-${SENTRY_CLI_VERSION}.tgz -o sentry-cli.tar.gz
elif [ "${TARGETARCH}" = "arm" ] || [ "${TARGETARCH}" = "armv7" ]; then
  curl -L --fail https://github.com/getsentry/sentry-cli/releases/download/${SENTRY_CLI_VERSION}/sentry-cli-linux-arm-${SENTRY_CLI_VERSION}.tgz -o sentry-cli.tar.gz
elif [ "${TARGETARCH}" = "386" ] || [ "${TARGETARCH}" = "i386" ] || [ "${TARGETARCH}" = "i686" ]; then
  curl -L --fail https://github.com/getsentry/sentry-cli/releases/download/${SENTRY_CLI_VERSION}/sentry-cli-linux-i686-${SENTRY_CLI_VERSION}.tgz -o sentry-cli.tar.gz
else
  echo "Unsupported target architecture: ${TARGETARCH}"
  exit 1
fi
EOT

# ---- Release ----
# build production ready image
FROM node:22.14.0-alpine AS release
ARG TARGETARCH
LABEL maintainer="opensource@kula.app"

# OCI Annotations (https://github.com/opencontainers/image-spec/blob/main/annotations.md)
LABEL org.opencontainers.image.title="OnLaunch" \
  org.opencontainers.image.description="OnLaunch is a service allowing app developers to notify app users about updates, warnings and maintenance." \
  org.opencontainers.image.url="http://onlaunch.app" \
  org.opencontainers.image.source="https://github.com/kula/OnLaunch" \
  org.opencontainers.image.vendor="kula app GmbH" \
  org.opencontainers.image.licenses="Apache-2.0"
# Note: org.opencontainers.image.created, org.opencontainers.image.version, and org.opencontainers.image.revision
# are set dynamically during Docker Hub automated builds via hooks/build

# Set tini as entrypoint
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Install sentry-cli
COPY --from=dl-sentry-cli /tmp/sentry-cli.tar.gz .
RUN tar -xvzf sentry-cli.tar.gz && \
  install -o root -g root -m 0755 package/bin/sentry-cli /usr/local/bin/sentry-cli && \
  rm -rf sentry-cli.tar.gz package

# Install Prisma CLI
COPY --from=prisma /tmp/.prisma-version .
RUN yarn global add prisma@$(cat .prisma-version) && \
  rm .prisma-version

# Change runtime working directory
WORKDIR /home/node/app/

# Setup the environment
COPY .yarnrc.yml .
COPY .yarn/releases .yarn/releases

# Setup custom runtime
COPY --chown=node:node docker/env.sh ./
RUN chmod +x env.sh

# Custom boot script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY --from=build --chown=node:node /home/node/app/package.json ./package.json
COPY --from=build --chown=node:node /home/node/app/yarn.lock ./yarn.lock

# copy remaining build output
COPY --from=build --chown=node:node /home/node/app/next.config.js ./next.config.js
COPY --from=build --chown=node:node /home/node/app/prisma ./prisma

# Copy the standalone server files directly to the app root
COPY --from=build --chown=node:node /home/node/app/.next/standalone/. ./
# Copy Next.js static assets to the expected location so that _next/static urls are valid
COPY --from=build --chown=node:node /home/node/app/.next/static ./.next/static
# Copy the public folder to the app root
COPY --from=build --chown=node:node /home/node/app/public ./public

# Inject Sentry Source Maps
RUN sentry-cli sourcemaps inject .next

# Select a non-root user to run the application
USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/home/node/app/node_modules/sharp

ENV PORT=3000
EXPOSE 3000

# Setup Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Smoke Tests
RUN set -x && \
  node --version && \
  sentry-cli --version && \
  prisma --version

# Set the default command to run the entrypoint script
CMD ["/usr/local/bin/entrypoint.sh"]
