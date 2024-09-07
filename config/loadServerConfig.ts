import { generateRandomHex } from "../util/random";
import { getEnvironment } from "./getEnvironment";
import { ServerConfig } from "./interfaces/ServerConfig";
import { parseBooleanEnvValue } from "./parser/parseBooleanEnvValue";
import { parseNumberEnvValue } from "./parser/parseNumberEnvValue";
import { parseSentinels } from "./parser/parseSentinels";
import { parseStringArrayEnvValue } from "./parser/parseStringArrayEnvValue";

export function loadServerConfig(): ServerConfig {
  let env = getEnvironment();

  return {
    adminApi: {
      requestLimit:
        // request limit per hour
        parseNumberEnvValue(env.ADMIN_API_REQUEST_LIMIT) ?? 1000,
    },
    nextAuth: {
      url: env.NEXTAUTH_URL ?? "http://localhost:3000",
      provider: {
        credentials: {
          isEnabled:
            parseBooleanEnvValue(env.AUTH_PROVIDER_CREDENTIALS_ENABLED) ?? true,
        },
        github: {
          clientId: env.AUTH_PROVIDER_GITHUB_CLIENT_ID,
          clientSecret: env.AUTH_PROVIDER_GITHUB_CLIENT_SECRET,
        },
        google: {
          clientId: env.AUTH_PROVIDER_GOOGLE_CLIENT_ID,
          clientSecret: env.AUTH_PROVIDER_GOOGLE_CLIENT_SECRET,
        },
      },
    },
    freeSub: {
      requestLimit:
        parseNumberEnvValue(env.SUBSCRIPTION_FREE_VERSION_LIMIT) ?? 42,
    },
    database: {
      url:
        env.DATABASE_URL ??
        "postgresql://onlaunch:password@localhost:5432/onlaunch?schema=public",
    },
    health: {
      apiKey: env.HEALTH_API_KEY ?? generateRandomHex(32),
    },
    usageReport: {
      apiKey: env.CRON_JOB_USAGE_REPORT_API_KEY || generateRandomHex(32),
    },
    emailContent: {
      senderName: env.SMTP_FROM_NAME ?? "OnLaunch",
      senderAddress: env.SMTP_FROM_EMAIL_ADDRESS ?? "onlaunch@kula.app",
    },
    redisConfig: {
      isEnabled: parseBooleanEnvValue(env.REDIS_ENABLED) ?? false,

      name: env.REDIS_SENTINEL_NAME,
      host: env.REDIS_HOST ?? "localhost",
      password: env.REDIS_PASSWORD ?? "password",
      port: parseNumberEnvValue(env.REDIS_PORT) ?? 6379,
      db: parseNumberEnvValue(env.REDIS_DB),

      cacheMaxAge: parseNumberEnvValue(env.REDIS_CACHE_MAX_AGE) ?? 60,

      isSentinelEnabled:
        parseBooleanEnvValue(env.REDIS_SENTINEL_ENABLED) ?? false,
      sentinels: parseSentinels(env.REDIS_SENTINELS),
      sentinelPassword: env.REDIS_SENTINEL_PASSWORD,
    },
    stripeConfig: {
      isEnabled: parseBooleanEnvValue(env.STRIPE_ENABLED) ?? false,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
      secretKey: env.STRIPE_SECRET_KEY || "",
      useAutomaticTax:
        parseBooleanEnvValue(env.STRIPE_USE_AUTOMATIC_TAX) ?? false,
      taxRates: parseStringArrayEnvValue(env.STRIPE_TAX_RATES),
      dynamicTaxRates: parseStringArrayEnvValue(env.STRIPE_DYNAMIC_TAX_RATES),
    },
    signup: {
      isEnabled: parseBooleanEnvValue(env.SIGNUPS_ENABLED) ?? false,
    },
    smtp: {
      host: env.SMTP_HOST ?? "localhost",
      port: parseNumberEnvValue(env.SMTP_PORT) ?? 1025,
      user: env.SMTP_USER ?? "",
      pass: env.SMTP_PASS ?? "",
    },
    sentryConfig: {
      debug: parseBooleanEnvValue(env.SENTRY_DEBUG?.toLowerCase()),
      dsn: env.SENTRY_DSN,
      env: env.SENTRY_ENV,
      release: env.SENTRY_RELEASE,
      replaysOnErrorSampleRate: parseNumberEnvValue(
        env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
      ),
      replaysSessionSampleRate: parseNumberEnvValue(
        env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      ),
      sampleRate: parseNumberEnvValue(env.SENTRY_SAMPLE_RATE),
      tracesSampleRate:
        parseNumberEnvValue(env.SENTRY_TRACES_SAMPLE_RATE) ?? 0.2,
    },
  };
}
