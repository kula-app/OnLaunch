import { loadServerConfig } from "@/config/loadServerConfig";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import * as Sentry from "@sentry/nextjs";

const sentryConfig = loadServerConfig().sentryConfig;
console.log("Initializing Sentry on server, using DSN:", sentryConfig.dsn);
if (!sentryConfig.isEnabled) {
  // eslint-disable-next-line no-console
  console.warn("⚠️ WARNING: SENTRY IS NOT ENABLED! ⚠️");
}

Sentry.init({
  enabled: sentryConfig.isEnabled,
  dsn: sentryConfig.dsn,
  debug: sentryConfig.debug,
  release: sentryConfig.release,
  environment: sentryConfig.environment,

  integrations: [
    Sentry.anrIntegration({
      anrThreshold: sentryConfig.anrThreshold,
      captureStackTrace: true,
    }),
    Sentry.extraErrorDataIntegration(),
    Sentry.prismaIntegration({
      prismaInstrumentation: new PrismaInstrumentation(),
    }),
  ],

  attachStacktrace: sentryConfig.attachStacktrace,
  sampleRate: sentryConfig.sampleRate,
  tracesSampleRate: sentryConfig.tracesSampleRate,
  profilesSampleRate: sentryConfig.profilesSampleRate,
});
