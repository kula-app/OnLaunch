#!/bin/bash

# Summary:
#   Client-side environment variables starting with `NEXT_PUBLIC_` are replaced with the value set in the environment at
#   build time, and produce a static output file, because there is no process environment available in a web browser.
#
#   This behaviour makes it impossible to create configurable container images, where the configuration should not be
#   hard-baked into the source code, but instead by configured by the host.
#
#   This script writes the process environment as an JSON object to the `public/__env.js` file, which is then loaded by
#   the browser, therefore exposing variables to the client.
#
#   It is not necessary to execute this script while developing locally, because the Next.js development server reads
#   the environment, and rebuilds files as required, therefore hard baking the correct values.
#
#   See more in the documentation of Next.js:
#   https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser
#
# Reference:
#   Based on env.sh by sparanoid, reduced to minimal necessary functionality.
#   https://github.com/sparanoid/env.sh

ENVSH_SED="sed"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macOS detected, switching to gsed"

    if command -v gsed >/dev/null 2>&1; then
        echo "Found: $(gsed --version | head -n 1)"
    else
        echo "gsed not found, trying to install..."

        if command -v brew >/dev/null 2>&1; then
            echo "Found: $(brew --version | head -n 1)"
            brew install gnu-sed
        else
            echo "Homebrew not found, install it first: https://brew.sh/"
            exit 1
        fi

    fi

    ENVSH_SED="gsed"
fi

# Filter all keys starting with "NEXT_PUBLIC_" from the current environment
env_vars=$(printenv | grep -o '^NEXT_PUBLIC_[A-Za-z0-9_]*')

# Build the JavaScript object string
js_object="{"
for var_name in $env_vars; do
    echo "Found variable in env: $var_name"

    # Trim the "NEXT_PUBLIC_" prefix from the variable name
    key=$(echo $var_name | $ENVSH_SED 's/^NEXT_PUBLIC_//')

    # Escape any quotes or backslashes in the variable value
    value=$(echo ${!var_name} | $ENVSH_SED 's/"/\\"/g' | sed 's/\\/\\\\/g')

    # Add the key-value pair to the object string
    js_object+="\"NEXT_PUBLIC_$key\":\"$value\","
done
js_object="${js_object%,}" # Remove the trailing comma
js_object+="}"

# Write the JavaScript object to a file
echo "window.__env = $js_object;" >public/__env.js
