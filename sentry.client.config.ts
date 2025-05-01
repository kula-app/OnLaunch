import { loadClientConfig } from "@/config/loadClientConfig";
import * as Sentry from "@sentry/nextjs";

async function initSentry() {
  const config = loadClientConfig();
  const sentryConfig = config.sentryConfig;

  console.log("Initializing Sentry on client, using DSN:", sentryConfig.dsn);
  if (!sentryConfig.isEnabled) {
    console.warn("⚠️ WARNING: SENTRY IS NOT ENABLED! ⚠️");
  }

  Sentry.init({
    enabled: sentryConfig.isEnabled,
    dsn: sentryConfig.dsn,
    debug: sentryConfig.debug,
    release: sentryConfig.release,
    environment: sentryConfig.environment,

    integrations: [Sentry.replayIntegration()],

    attachStacktrace: sentryConfig.attachStacktrace,
    sampleRate: sentryConfig.sampleRate,
    tracesSampleRate: sentryConfig.tracesSampleRate,
    profilesSampleRate: sentryConfig.profilesSampleRate,
    replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
    replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,
  });
}

void initSentry();
