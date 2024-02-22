# Configuration

## How to configure OnLaunch

The configuration of OnLaunch is managed in one configuration structure, defined in [`Config.ts`](/config/interfaces/Config.ts) and loaded using the [`loadConfig.ts`](/config/loadConfig.ts). See both files for details on the implementation.

You can adapt the configuration by setting values in the environment, i.e. `DATABASE_URL` to configure the database connection url.

As OnLaunch is built using [Next.js](https://nextjs.org), environment variables used by the frontend (i.e. `SENTRY_DSN`) need to be defined as environment variables with `NEXT_PUBLIC_` as the prefix. As defined in [Next.js environment configuration documentation](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser) these variables are replaced at **build time**, and replaced with hard-coded values.

To offer you with pre-build Docker container images, we know that hard-coded configuration is pretty much useless.
Therefore, we implemented an approach to provide environment variables in the browser by writing a file `__env.js` which is loaded as a HTML script dependency, to adapt the `window.env`.

**The file `__env.js` should be updated at the startup of the server. See the `CMD` command in the [`Dockerfile`](/Dockerfile) for an example.**

For convenience we are providing you with a Bash script [`env.sh`](/docker/env.sh) to parse the executing environment and write it as valid JavaScript code to `__env.js`. See the script for details on usage.

**ATTENTION: All content of the `__env.js` is ✨publicly✨ accessible, so be certain with what environment fields you ware writing into it.**

## Client

This section covers the client-side configuration.

### Sentry - Client-Side

TODO: add documentation for client-side Sentry configuration

### Stripe - Client-Side

TODO: add documentation for client-side Stripe configuration

## Server

This section covers the server-side configuration.

### Database

TODO: add documentation

### Emails

TODO: add documentation

### Free-Tier Subscription

TODO: add documentation

### Health

TODO: add documentation

### NextAuth.js - Authentication

TODO: add documentation

### Redis

TODO: add documentation

### Sentry - Server-Side

TODO: add documentation

### Signup

TODO: add documentation

### SMTP

TODO: add documentation

### Stripe - Server-Side

TODO: add documentation

### Usage Reporting

TODO: add documentation

### Health Check

TODO: add documentation

### Additional considerations when deploying to Kubernetes

- Kubernetes Secrets
