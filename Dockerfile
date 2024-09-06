# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20.17.0 AS base

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

FROM base AS dependencies_production
# Install production node_modules, excluding 'devDependencies'
RUN \
  --mount=type=cache,target=/root/.yarn/cache \
  yarn workspaces focus --production

# Copy the generated prisma client into the production node_modules
COPY --from=dependencies_development /home/node/app/prisma ./prisma
COPY --from=dependencies_development /home/node/app/node_modules/.prisma ./node_modules/.prisma

# ---- Build Setup ----
FROM base AS build
# Copy resources required for the build process.
# Caching depends on previous layers, therefore a changed layer will invalidate all following layers.
# Order the layers from least-to-change to frequent-to-change.

# Rarely changed
COPY sentry.client.config.ts .
COPY instrumentation.ts .

COPY postcss.config.js .
COPY tailwind.config.js .

COPY config ./config
COPY fonts ./fonts
COPY mailTemplate ./mailTemplate
COPY public ./public

# Regularly changed
COPY types ./types
COPY hooks ./hooks
COPY styles ./styles
COPY util ./util
COPY components ./components
COPY theme ./theme

# Frequently changed
COPY lib ./lib
COPY models ./models
COPY routes ./routes
COPY api ./api
COPY app ./app
COPY pages ./pages

# copy node_modules with all build tools included
COPY --from=dependencies_development /home/node/app/prisma ./prisma
COPY --from=dependencies_development /home/node/app/node_modules ./node_modules

# build the server
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# # ---- Release ----
# build production ready image
FROM node:20.17.0-slim AS release
LABEL maintainer="opensource@kula.app"

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="OnLaunch"
LABEL org.label-schema.description="OnLaunch is a service allowing app developers to notify app users about updates, warnings and maintenance."
LABEL org.label-schema.url="http://kula.app/onlaunch"
LABEL org.label-schema.vcs-url="https://github.com/kula/OnLaunch"
LABEL org.label-schema.vendor="kula app GmbH"

# install additional dependencies
# - openssl: required for prisma
# - tini: required for signal handling
RUN apt-get update -qq > /dev/null  \
  && apt-get install -qq --no-install-recommends \
  openssl \
  tini \
  && rm -rf /var/lib/apt/lists/*
# Set tini as entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]

# Change runtime working directory
WORKDIR /home/node/app/

# Setup the environment
COPY .yarnrc.yml .
COPY .yarn/releases .yarn/releases

# Setup custom runtime
COPY --chown=node:node docker/env.sh ./
RUN chmod +x env.sh

# copy production node_modules
COPY --from=dependencies_production --chown=node:node /home/node/app/node_modules ./node_modules

# copy remaining build output
COPY --from=build /home/node/app/next.config.js ./next.config.js
COPY --from=build /home/node/app/prisma ./prisma
COPY --from=build --chown=node:node /home/node/app/public ./public
COPY --from=build --chown=node:node /home/node/app/.next  ./.next

# select user
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
RUN ./node_modules/.bin/next info

# Run application
CMD ["/bin/bash", "-c", "./env.sh && ./node_modules/.bin/prisma migrate deploy && ./node_modules/.bin/next start"]
