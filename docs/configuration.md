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

To configure Sentry for client-side error tracking in OnLaunch:

1. Sign up for [Sentry](https://sentry.io/) and create a new project.
2. Find your Sentry DSN in the project settings under "Client Keys (DSN)".
3. In your `.env` file, set `SENTRY_DSN` to your client-side Sentry DSN.
4. Ensure you prefix it with `NEXT_PUBLIC_` if you want it to be accessible in your frontend code, like this: `NEXT_PUBLIC_SENTRY_DSN=<your_dsn_here>`.
5. Initialize Sentry in your application with the DSN. You can do this in the main entry file of your Next.js app or wherever you see fit.

You can see an example of how the parameters are used in `sentry.client.config.ts`.

### Stripe - Client-Side

To set up Stripe for client-side operations in OnLaunch:

1. Sign up for a [Stripe](https://stripe.com/) account and get your publishable key.
2. In your `.env` file, add your Stripe publishable key as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your_publishable_key_here>`.
3. Stripe is disabled by default, so ensure `NEXT_PUBLIC_STRIPE_ENABLED` is set to `true` in your `.env` file to enable Stripe features.

## Server

This section covers the server-side configuration.

### Database

The `DATABASE_URL` environment variable configures the connection to the PostgreSQL database. It includes the username, password, host, port, and database name. Ensure this variable is set according to your production database credentials for deployment.

For local development, the provided URL works with the default Docker Compose setup. For production, replace the username, password, host, and database name with your actual credentials.

Example:
```plaintext
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database_name>?schema=public"
```

### Free-Tier Subscription

If you have Stripe enabled, you can set the amount of maximum allowed requests for the free tier by `SUBSCRIPTION_FREE_VERSION_LIMIT=<request limit>`.

### NextAuth.js - Authentication

This secret is used to encrypt the NextAuth.js JWT. For more information visit the [NextAuth.js Documentation](https://next-auth.js.org/).

### Redis

Redis is used for caching and session storage, significantly improving the performance and scalability of the application. 

```
REDIS_ENABLED=true
REDIS_HOST=<your_redis_host>
REDIS_PASSWORD=<your_redis_password>
REDIS_PORT=6379
REDIS_SENTINEL_ENABLED=false
REDIS_SENTINELS=<sentinels_if_any>
REDIS_SENTINEL_NAME=<sentinel_name_if_any>
REDIS_CACHE_MAX_AGE=60 // cache max age in minutes
```

### Sentry - Server-Side

Similar to Sentry on the client-side, you can see how the parameters are used in `sentry.server.config.tx`. 

### Signup

The config value of `SIGNUPS_ENABLED` (default: `false`) is used to allow new signups to the system.

### SMTP

OnLaunch uses SMTP to send emails. Configure the SMTP server details with the prefix `SMTP_` in your `.env` file:

- `SMTP_HOST`: The host address of your SMTP server.
- `SMTP_PORT`: The port your SMTP server uses.
- `SMTP_USER` and `SMTP_PASS`: The username and password for SMTP authentication, if required.
- `SMTP_FROM_EMAIL_ADDRESS` and `SMTP_FROM_NAME`: The email address and name that will appear as the sender.

Ensure these values are set to match your email service provider's requirements.

### Email Templates

In the directory `/mailTemplate` you can find various templates for mails that are used in the application. Currently, we provide templates for:

- Change email
- Email changed (for the old account)
- Direct invites
- Direct invites for a new user (who is not in the system yet)
- Reset password
- Verify account

In the config, `SMTP_FROM_EMAIL_ADDRESS` is used in the templates and is the email that will be displayed to the recipient. Furthermore, the templates use `SMTP_FROM_NAME` as a name for the sender in the greeting line.


### Stripe - Server-Side

`STRIPE_ENABLED`: Similar to the client-side above but intended for server-side logic. This flag can enable or disable Stripe functionality in your backend services, such as processing payments or handling webhooks. This separation allows for more granular control over where and how Stripe is used within your application.

`STRIPE_WEBHOOK_SECRET`: Webhooks are used by Stripe to notify your application of events that happen in your Stripe account. The webhook secret is used to verify that POST requests sent to your webhook endpoints are from Stripe. This is critical for securing your webhook processing logic.

`STRIPE_SECRET_KEY`: Your Stripe secret key is required for server-side operations, such as creating charges and managing subscriptions. This key should be kept secure and not exposed to the public or your frontend code.

`STRIPE_USE_AUTOMATIC_TAX`: This indicates whether your application should utilize Stripe's automatic tax calculation features. It can simplify how you handle taxes on transactions but requires additional setup within your Stripe dashboard.

`STRIPE_TAX_RATES`: If you're not using automatic tax calculations, you might specify fixed tax rates that apply to your transactions. This variable could be used to store IDs of tax rates configured in your Stripe dashboard.

`STRIPE_DYNAMIC_TAX_RATES`: For more complex tax scenarios, Stripe supports dynamic tax rates that can be applied based on the customer's location and the type of product being sold. This variable could be used to manage such dynamic tax scenarios, though implementing this feature requires careful consideration of tax laws and regulations.

### Usage Reporting

As we implemented metered billing for Stripe, we have to periodically report the usage to Stripe. To do so, you can set up a cron job that calls the `/api/usageReport` endpoint with the `CRON_JOB_USAGE_REPORT_API_KEY` token provided in the config.

### Health Check

The health check in the backend checks the postgres database and the redis (if enabled) connection. To address the health backend, provide the key `HEALTH_API_KEY` for authorization at the route `/api/health`.

### Additional considerations when deploying to Kubernetes

- Kubernetes Secrets
