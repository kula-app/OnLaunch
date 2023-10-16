import { DatabaseConfig } from "./DatabaseConfig";
import { EmailContentConfig } from "./EmailContentConfig";
import { FreeSubConfig } from "./FreeSubConfig";
import { HealthConfig } from "./HealthConfig";
import { NextAuthConfig } from "./NextAuthConfig";
import { RedisConfig } from "./RedisConfig";
import { SentryConfig } from "./SentryConfig";
import { SignupConfig } from "./SignupConfig";
import { SmtpConfig } from "./SmtpConfig";
import { StripeConfig } from "./StripeConfig";
import { UsageReportConfig } from "./UsageReportConfig";

export interface Config {
  client: {
    sentryConfig: SentryConfig;
  };
  server: {
    database: DatabaseConfig;
    emailContent: EmailContentConfig;
    freeSub: FreeSubConfig;
    health: HealthConfig;
    nextAuth: NextAuthConfig;
    redisConfig: RedisConfig;
    sentryConfig: SentryConfig;
    signup: SignupConfig;
    smtp: SmtpConfig;
    stripeConfig: StripeConfig;
    usageReport: UsageReportConfig;
  };
}
