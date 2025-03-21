import { generateRandomHex } from "../util/random";
import { getEnvironment } from "./getEnvironment";
import { ServerConfig } from "./interfaces/ServerConfig";
import {
  parseBooleanEnvValue,
  parseBooleanEnvValueWithDefault,
} from "./parser/parseBooleanEnvValue";
import { parseNumberEnvValue } from "./parser/parseNumberEnvValue";
import { parseSentinels } from "./parser/parseSentinels";
import { parseStringArrayEnvValue } from "./parser/parseStringArrayEnvValue";

export function loadServerConfig(): ServerConfig {
  let env = getEnvironment();

  const config: ServerConfig = {
    adminApi: {
      requestLimit:
        // request limit per hour
        parseNumberEnvValue(env.ADMIN_API_REQUEST_LIMIT) ?? 1000,
    },
    baseConfig: {
      url: env.BASE_URL ?? "http://localhost:3000",
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
      isEnabled:
        parseBooleanEnvValue(env.SENTRY_ENABLED?.toLowerCase()) ?? true,
      debug: parseBooleanEnvValue(env.SENTRY_DEBUG?.toLowerCase()) ?? false,
      dsn: env.SENTRY_DSN,
      release: env.SENTRY_RELEASE,
      environment: env.SENTRY_ENV,
      attachStacktrace: parseBooleanEnvValueWithDefault(
        env.SENTRY_ATTACH_STACKTRACE?.toLowerCase(),
        true,
      ),
      replaysOnErrorSampleRate: parseNumberEnvValue(
        env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
      ),
      replaysSessionSampleRate: parseNumberEnvValue(
        env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      ),
      sampleRate: parseNumberEnvValue(env.SENTRY_SAMPLE_RATE),
      profilesSampleRate: parseNumberEnvValue(env.SENTRY_PROFILES_SAMPLE_RATE),
      tracesSampleRate: parseNumberEnvValue(env.SENTRY_TRACES_SAMPLE_RATE),
      // Increased the default threshold to 10 seconds, due to slow startup times on Kubernetes
      anrThreshold: parseNumberEnvValue(env.SENTRY_ANR_THRESHOLD) ?? 10_000,
    },
  };
  return config;
}
