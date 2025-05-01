import { loadClientConfig } from "@/config/loadClientConfig";
import * as Sentry from "@sentry/nextjs";

const sentryConfig = loadClientConfig().sentryConfig;
console.log("Initializing Sentry on edge, using DSN:", sentryConfig.dsn);
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

  integrations: [Sentry.extraErrorDataIntegration()],

  attachStacktrace: sentryConfig.attachStacktrace,
  sampleRate: sentryConfig.sampleRate,
  tracesSampleRate: sentryConfig.tracesSampleRate,
  profilesSampleRate: sentryConfig.profilesSampleRate,
  replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
  replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,
});
