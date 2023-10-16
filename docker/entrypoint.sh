#!/bin/sh

echo "Executing entrypoint.sh"

./env.sh

# tini is expected to be available, so make sure it is installed in the Dockerfile
/usr/bin/tini -- "$@"
