import * as crypto from "crypto";
import { Config } from "./interfaces/Config";
import { parseBooleanEnvValue } from "./parser/parseBooleanEnvValue";
import { parseNumberEnvValue } from "./parser/parseNumberEnvValue";
import { parseSentinels } from "./parser/parseSentinels";
import { parseStringArrayEnvValue } from "./parser/parseStringArrayEnvValue";

function getEnvironment(): {
  [keyof: string]: string | undefined;
} {
  let env: {
    [keyof: string]: string | undefined;
  };
  if (typeof window === "undefined") {
    // Called by the backend, therefore access the process environment
    env = process.env;
  } else {
    // Called by the frontend, therefore access the global environment constant defined in  /__env.js
    const this_window = window as unknown as Window & {
      __env: {
        [keyof: string]: string;
      };
    };
    env = this_window.__env;
  }
  return env ?? {};
}

function sortKeys<T extends { [keyof: string]: unknown }>(obj: T): T {
  return Object.keys(obj as any)
    .sort()
    .reduce((acc: { [keyof: string]: unknown }, key) => {
      acc[key] = obj[key];
      return acc;
    }, {}) as T;
}

export function loadConfig(): Config {
  let env = getEnvironment();

  const adaptedConfig: Config = {
    client: {
      sentryConfig: {
        debug: parseBooleanEnvValue(
          env.SENTRY_DEBUG ?? env.NEXT_PUBLIC_SENTRY_DEBUG
        ),
        dsn: env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN,
        env: env.SENTRY_ENV ?? env.NEXT_PUBLIC_SENTRY_ENV,
        release: env.SENTRY_RELEASE ?? env.NEXT_PUBLIC_SENTRY_RELEASE,
        replaysOnErrorSampleRate: parseNumberEnvValue(
          env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ??
            env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
        ),
        replaysSessionSampleRate: parseNumberEnvValue(
          env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ??
            env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
        ),
        sampleRate: parseNumberEnvValue(
          env.SENTRY_SAMPLE_RATE ?? env.NEXT_PUBLIC_SENTRY_SAMPLE_RATE
        ),
        tracesSampleRate:
          parseNumberEnvValue(
            env.SENTRY_TRACES_SAMPLE_RATE ??
              env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
          ) ?? 0.2,
      },
      stripeConfig: {
        isEnabled:
          parseBooleanEnvValue(env.STRIPE_ENABLED) ??
          parseBooleanEnvValue(env.NEXT_PUBLIC_STRIPE_ENABLED) ??
          false,
      },
    },
    server: {
      nextAuth: {
        url: env.NEXTAUTH_URL ?? "http://localhost:3000",
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
        apiKey: env.HEALTH_API_KEY ?? crypto.randomBytes(32).toString("hex"),
      },
      usageReport: {
        apiKey:
          env.CRON_JOB_USAGE_REPORT_API_KEY ||
          crypto.randomBytes(32).toString("hex"),
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
        apiVersion: env.STRIPE_API_VERSION || "",
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
          env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
        ),
        replaysSessionSampleRate: parseNumberEnvValue(
          env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE
        ),
        sampleRate: parseNumberEnvValue(env.SENTRY_SAMPLE_RATE),
        tracesSampleRate:
          parseNumberEnvValue(env.SENTRY_TRACES_SAMPLE_RATE) ?? 0.2,
      },
    },
  };

  // we need to make sure keys are always in the same order to prevent "Text content did not match" issue
  // when displaying config on a page
  adaptedConfig.client = sortKeys(adaptedConfig.client);

  return adaptedConfig;
}
