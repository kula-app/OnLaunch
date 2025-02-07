import { loadClientConfig } from "@/config/loadClientConfig";
import * as Sentry from "@sentry/nextjs";

async function initSentry() {
  const config = loadClientConfig();
  const sentryConfig = config.sentryConfig;

  console.log("Initializing Sentry on client, using DSN:", sentryConfig.dsn);
  if (!sentryConfig.enabled) {
    console.warn("⚠️ WARNING: SENTRY IS NOT ENABLED! ⚠️");
  }

  Sentry.init({
    enabled: sentryConfig.enabled,
    dsn: sentryConfig.dsn,
    debug: sentryConfig.debug,

    release: sentryConfig.release,

    replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
    replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,

    integrations: [Sentry.replayIntegration()],

    tracesSampler: (samplingContext) => {
      // Ignore the health endpoint from trace sampling
      if (samplingContext.transactionContext.name == "GET /api/health") {
        return false;
      }
      return sentryConfig.tracesSampleRate ?? 0.2;
    },
    sampleRate: sentryConfig.sampleRate,
  });
}

void initSentry();
