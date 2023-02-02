# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:18 AS base
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
# Node --     Install Production & Development Node Dependencies
FROM project_setup AS dependencies
# install project node libs in production mode
RUN yarn install \
  --frozen-lockfile \
  --no-progress \
  --ignore-scripts \
  --production
# copy production node_modules aside to cache them for the final build
RUN cp -R node_modules          prod_node_modules
# # install ALL node_modules, including 'devDependencies'
# RUN yarn install \
#   --frozen-lockfile \
#   --ignore-scripts \
#   --no-progress

# ---- Build Setup ----
FROM project_setup AS build_setup
# copy app sources
COPY prisma ./prisma
COPY components  ./components
COPY pages  ./pages
COPY public ./public
COPY styles ./styles

# ---- Development ----
# build development server
FROM build_setup AS build_development
# copy node_modules with all build tools included
COPY --from=dependencies /home/node/app/node_modules ./node_modules

# ---- Production ----
# build production server
FROM build_development AS build_production
# build the server
ENV NEXT_TELEMETRY_DISABLED 1
# RUN yarn prisma generate
# RUN yarn build

# # ---- Release ----
# build production ready image
FROM node:18 AS release
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
# copy production dependencies
COPY --from=dependencies      /home/node/app/prod_node_modules  ./node_modules
# # copy build output
COPY --from=build_production  /home/node/app/public             ./public
# COPY --from=build_production  /home/node/app/.next              ./.next

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
CMD [ "node", "node_modules/.bin/next", "start" ]