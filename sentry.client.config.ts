import * as Sentry from "@sentry/nextjs";
import { loadConfig } from "./config/loadConfig";

const config = loadConfig();

Sentry.init({
  dsn: config.sentryConfig.dsn,
  debug: config.sentryConfig.debug,

  release: config.sentryConfig.release,

  replaysOnErrorSampleRate: config.sentryConfig.replaysOnErrorSampleRate,
  replaysSessionSampleRate: config.sentryConfig.replaysSessionSampleRate,

  tracesSampler: (samplingContext) => {
    // Ignore the health endpoint from trace sampling
    if (samplingContext.transactionContext.name == "GET /api/health") {
      return false;
    }
    return config.sentryConfig.tracesSampleRate ?? 0.2;
  },
  sampleRate: config.sentryConfig.sampleRate,
});
