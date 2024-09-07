import * as Sentry from '@sentry/nextjs';
import { loadClientConfig } from './config/loadClientConfig';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { loadServerConfig } = await import('./config/loadServerConfig');
    const sentryConfig = loadServerConfig().sentryConfig;
    Sentry.init({
      dsn: sentryConfig.dsn,
      debug: sentryConfig.debug,

      release: sentryConfig.release,

      replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
      replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,

      tracesSampler: (samplingContext) => {
        // Ignore the health endpoint from trace sampling
        if (samplingContext.transactionContext.name == 'GET /api/health') {
          return false;
        }
        return sentryConfig.tracesSampleRate;
      },
      sampleRate: sentryConfig.sampleRate,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const sentryConfig = loadClientConfig().sentryConfig;

    Sentry.init({
      dsn: sentryConfig.dsn,
      debug: sentryConfig.debug,

      release: sentryConfig.release,

      replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,
      replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,

      tracesSampler: (samplingContext) => {
        // Ignore the health endpoint from trace sampling
        if (samplingContext.transactionContext.name == 'GET /api/health') {
          return false;
        }
        return sentryConfig.tracesSampleRate;
      },
      sampleRate: sentryConfig.sampleRate,
    });
  }
}
