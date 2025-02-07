#!/bin/sh

set -ex

if [ ! -z "$SENTRY_RELEASE" ]; then
  echo "Creating Sentry release '$SENTRY_RELEASE' ..."

  if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "Error: SENTRY_AUTH_TOKEN environment variable must be set"
    exit 1
  fi
  if [ -z "$SENTRY_ORG" ]; then
    echo "Error: SENTRY_ORG environment variable must be set"
    exit 1
  fi
  if [ -z "$SENTRY_PROJECT" ]; then
    echo "Error: SENTRY_PROJECT environment variable must be set"
    exit 1
  fi
  if [ -z "$SENTRY_ENV" ]; then
    echo "Error: SENTRY_ENV environment variable must be set"
    exit 1
  fi

  yarn sentry-cli login --auth-token $SENTRY_AUTH_TOKEN
  yarn sentry-cli releases new $SENTRY_RELEASE
  yarn sentry-cli sourcemaps upload apps packages
  yarn sentry-cli releases finalize $SENTRY_RELEASE

  echo "Sentry release '$SENTRY_RELEASE' created"
fi

echo "Setup environment variables..."
./env.sh

echo "Deploying Prisma migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Starting API..."
./node_modules/.bin/next start
