#!/bin/sh

set -e

if [ ! -z "$SENTRY_CREATE_RELEASE" ]; then
  echo "[entrypoint.sh] Configured to create release in Sentry"

  if [ ! -z "$SENTRY_RELEASE" ]; then
    echo "[entrypoint.sh] Creating Sentry release '$SENTRY_RELEASE' ..."

    if [ -z "$SENTRY_AUTH_TOKEN" ]; then
      echo "[entrypoint.sh] Error: SENTRY_AUTH_TOKEN environment variable must be set"
      exit 1
    fi
    if [ -z "$SENTRY_ORG" ]; then
      echo "[entrypoint.sh] Error: SENTRY_ORG environment variable must be set"
      exit 1
    fi
    if [ -z "$SENTRY_PROJECT" ]; then
      echo "[entrypoint.sh] Error: SENTRY_PROJECT environment variable must be set"
      exit 1
    fi
    if [ -z "$SENTRY_ENV" ]; then
      echo "[entrypoint.sh] Error: SENTRY_ENV environment variable must be set"
      exit 1
    fi

    echo "[entrypoint.sh] Creating Sentry Release"
    ./node_modules/.bin/sentry-cli login --auth-token $SENTRY_AUTH_TOKEN
    ./node_modules/.bin/sentry-cli releases new $SENTRY_RELEASE
    if [ ! -z "$SENTRY_UPLOAD_SOURCEMAPS" ]; then
      echo "[entrypoint.sh] Uploading Sourcemaps"
      ./node_modules/.bin/sentry-cli sourcemaps upload --release $SENTRY_RELEASE .next
    else
      echo "[entrypoint.sh] Skipped Uploading Sourcemaps"
    fi
    echo "[entrypoint.sh] Finalizing Sentry Release"
    ./node_modules/.bin/sentry-cli releases finalize $SENTRY_RELEASE

    echo "[entrypoint.sh] Sentry release created: $SENTRY_RELEASE"
  else
    echo "[entrypoint.sh] Create Sentry release is enabled, but not defined in SENTRY_RELEASE"
  fi
fi

echo "[entrypoint.sh] Setup environment variables..."
. ./env.sh

echo "[entrypoint.sh] eploying Prisma migrations..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint.sh] Starting server..."
./node_modules/.bin/next start
