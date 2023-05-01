import * as Sentry from "@sentry/nextjs";
import { loadConfig } from "./config/loadConfig";

const config = loadConfig();

Sentry.init({
  dsn: config.sentryConfig.dsn,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
