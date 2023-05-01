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

interface SentryConfig {
  dsn: string;
  replaysSessionSampleRate: number;
}

interface Config {
  nextAuth: NextAuthConfig;
  signup: SignupConfig;
  database: DatabaseConfig;
  health: HealthConfig;
  smtp: SmtpConfig;
  emailContent: EmailContentConfig;
  sentryConfig: SentryConfig;
}

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
    sentryConfig: {
      dsn: process.env.SENTRY_DSN || "",
      replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE) || 0.1,
    },
  };
}
