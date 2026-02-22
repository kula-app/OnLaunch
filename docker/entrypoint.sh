#!/bin/sh

set -e

echo "[entrypoint.sh] Setup environment variables..."
. ./env.sh

echo "[entrypoint.sh] Deploying Prisma migrations..."
prisma migrate deploy

echo "[entrypoint.sh] Starting Next.js server in standalone mode..."
exec node server.js
