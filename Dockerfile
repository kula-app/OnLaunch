# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20.6.0 AS base
# install additional dependencies
# --> noop

# ---- Project Setup ----
# Install Production & Development Dependencies
FROM base AS project_setup
# Set Working Directory
WORKDIR /home/node/app

# Node Dependency Management
COPY package.json .
COPY yarn.lock .

# Files required for compilation
COPY next.config.js .
COPY tsconfig.json .

# ---- Dependencies ----
# Node -- Install Production & Development Node Dependencies
FROM project_setup AS dependencies
# install ALL node_modules, including 'devDependencies'
RUN yarn install \
  --frozen-lockfile \
  --ignore-scripts \
  --no-progress \
  --network-timeout 1000000

# ---- Build Setup ----
FROM project_setup AS build_setup
# Copy resources required for the build process.
# Caching depends on previous layers, therefore a changed layer will invalidate all following layers.
# Order the layers from least-to-change to frequent-to-change.

# Rarely changed
COPY sentry.client.config.ts .
COPY sentry.edge.config.ts .
COPY sentry.server.config.ts .

COPY postcss.config.js .
COPY tailwind.config.js .

COPY config ./config
COPY fonts ./fonts
COPY mailTemplate ./mailTemplate
COPY public ./public

# Regularly changed
COPY types ./types
COPY styles ./styles
COPY util ./util
COPY components ./components

# Frequently changed
COPY lib ./lib
COPY models ./models
COPY prisma ./prisma
COPY routes ./routes
COPY api ./api
COPY pages ./pages

# ---- Production ----
# build development server
FROM build_setup AS build_production
# copy node_modules with all build tools included
COPY --from=dependencies /home/node/app/node_modules ./node_modules
# build the server
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn prisma generate
RUN yarn build

# # ---- Release ----
# build production ready image
FROM node:20.6.0-slim AS release
LABEL maintainer="opensource@kula.app"

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.name="OnLaunch"
LABEL org.label-schema.description="OnLaunch is a service allowing app developers to notify app users about updates, warnings and maintenance."
LABEL org.label-schema.url="http://kula.app/onlaunch"
LABEL org.label-schema.vcs-url="https://github.com/kula/OnLaunch"
LABEL org.label-schema.vendor="kula app GmbH"

# install additional dependencies
RUN apt-get update -qq > /dev/null  \
  && apt-get install -qq --no-install-recommends \
  curl \
  tini \
  && rm -rf /var/cache/apk/*
# Set tini as entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]

# Change runtime working directory
WORKDIR /home/node/app/

# copy build output required for yarn install for better build efficiency
COPY --from=build_production /home/node/app/package.json ./
COPY --from=build_production /home/node/app/prisma       ./prisma

# install production dependencies
RUN yarn install \
  --frozen-lockfile \
  --no-progress \
  --production \
  --network-timeout 1000000

# copy remaining build output
COPY --from=build_production --chown=node:node /home/node/app/public ./public
COPY --from=build_production --chown=node:node /home/node/app/.next  ./.next

# select user
USER node

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

ENV PORT 3000
EXPOSE 3000

# Setup Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run application
CMD ["/bin/bash", "-c", "./node_modules/.bin/prisma migrate deploy && ././node_modules/.bin/next start"]
