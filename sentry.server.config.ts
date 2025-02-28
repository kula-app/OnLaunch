import { loadServerConfig } from "@/config/loadServerConfig";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import * as Sentry from "@sentry/nextjs";

const sentryConfig = loadServerConfig().sentryConfig;

Sentry.init({
  enabled: sentryConfig.enabled,
  dsn: sentryConfig.dsn,
  debug: sentryConfig.debug,

  release: sentryConfig.release,
  environment: sentryConfig.env,

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

  replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
  replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,

  tracesSampler: (samplingContext) => {
    // Ignore the health endpoint from trace sampling
    if (samplingContext.transactionContext.name == "GET /api/health") {
      return false;
    }
    return sentryConfig.tracesSampleRate ?? 0.2;
  },

  sampleRate: sentryConfig.sampleRate,
  profilesSampleRate: sentryConfig.profilesSampleRate,
});
