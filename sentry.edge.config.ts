import * as Sentry from "@sentry/nextjs";
import { loadConfig } from "./config/loadConfig";

const sentryConfig = loadConfig().server.sentryConfig;

Sentry.init({
  dsn: sentryConfig.dsn,
  debug: sentryConfig.debug,

  release: sentryConfig.release,

  replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
  replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,

  tracesSampler: (samplingContext) => {
    // Ignore the health endpoint from trace sampling
    if (samplingContext.transactionContext.name == "GET /api/health") {
      return false;
    }
    return sentryConfig.tracesSampleRate;
  },
  sampleRate: sentryConfig.sampleRate,
});
