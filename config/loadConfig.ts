import * as crypto from "crypto";

interface NextAuthConfig {
  url: string;
}

interface SignupConfig {
  isEnabled: boolean;
}

interface DatabaseConfig {
  url: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

interface EmailContentConfig {
  senderName: string;
  senderAddress: string;
}

interface HealthConfig {
  apiKey: string;
}
export interface RedisConfig {
  isSentinelEnabled?: boolean;
  sentinels?: { host: string; port: number }[];
  name?: string; // name of the Redis service
  host?: string;
  password?: string;
  port?: number;
  cacheMaxAge: number;
}

interface SentryConfig {
  debug?: boolean;
  dsn?: string;
  env?: string;
  release?: string;
  replaysOnErrorSampleRate?: number;
  replaysSessionSampleRate?: number;
  sampleRate?: number;
  tracesSampleRate?: number;
}

interface StripeConfig {
  apiVersion: string;
  webhookSecret: string;
  secretKey: string;
  publishableKey: string;
}

interface Config {
  nextAuth: NextAuthConfig;
  signup: SignupConfig;
  database: DatabaseConfig;
  health: HealthConfig;
  smtp: SmtpConfig;
  emailContent: EmailContentConfig;
  redisConfig: RedisConfig;
  sentryConfig: SentryConfig;
  stripeConfig: StripeConfig;
}

/**
 * Tries to parse the given value into a number.
 * Returns `undefined` if the value is `undefined`.
 *
 * @param value String value from the environment, e.g. `process.env.MY_ENV_VAR`
 * @returns
 */
function parseNumberEnvValue(value?: string): number | undefined {
  if (value == undefined) {
    return undefined;
  }
  return Number(value);
}

// Parse the sentinels from an environment variable
const parseSentinels = (sentinelString?: string) => {
  if (!sentinelString) return undefined;
  return sentinelString.split(",").map((item) => {
    const [host, port] = item.split(":");
    return { host, port: Number(port) };
  });
};

export function loadConfig(): Config {
  return {
    nextAuth: {
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    },
    signup: {
      isEnabled: process.env.SIGNUPS_ENABLED == "true" || false,
    },
    database: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://onlaunch:password@localhost:5432/onlaunch?schema=public",
    },
    health: {
      apiKey:
        process.env.HEALTH_API_KEY || crypto.randomBytes(32).toString("hex"),
    },
    smtp: {
      host: process.env.SMTP_HOST || "localhost",
      port: Number(process.env.SMTP_PORT) || 1025,
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
    emailContent: {
      senderName: process.env.SMTP_FROM_NAME || "OnLaunch",
      senderAddress: process.env.SMTP_FROM_EMAIL_ADDRESS || "onlaunch@kula.app",
    },
    redisConfig: {
      isSentinelEnabled: process.env.REDIS_SENTINEL_ENABLED == "true" || false,
      sentinels: parseSentinels(process.env.REDIS_SENTINELS),
      name: process.env.REDIS_SENTINEL_NAME,
      host: process.env.REDIS_HOST || "",
      password: process.env.REDIS_PASSWORD || "",
      port: Number(process.env.REDIS_PORT) || 6379,
      cacheMaxAge: Number(process.env.REDIS_CACHE_MAX_AGE) || 60,
    },
    sentryConfig: {
      debug: process.env.SENTRY_DEBUG?.toLowerCase() == "true",
      dsn: process.env.SENTRY_DSN,
      env: process.env.SENTRY_ENV,
      release: process.env.SENTRY_RELEASE,
      replaysOnErrorSampleRate: parseNumberEnvValue(
        process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
      ),
      replaysSessionSampleRate: parseNumberEnvValue(
        process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE
      ),
      sampleRate: parseNumberEnvValue(process.env.SENTRY_SAMPLE_RATE),
      tracesSampleRate: parseNumberEnvValue(
        process.env.SENTRY_TRACES_SAMPLE_RATE
      ),
    },
    stripeConfig: {
      apiVersion: process.env.STRIPE_API_VERSION || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    },
  };
}
