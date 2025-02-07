import { getEnvironment } from "./getEnvironment";
import { ClientConfig } from "./interfaces/ClientConfig";
import {
  parseBooleanEnvValue,
  parseBooleanEnvValueWithDefault,
} from "./parser/parseBooleanEnvValue";
import { parseNumberEnvValue } from "./parser/parseNumberEnvValue";
import { sortKeys } from "./sortKeys";

export function loadClientConfig(): ClientConfig {
  let env = getEnvironment();

  const adaptedConfig: ClientConfig = {
    baseConfig: {
      url: env.BASE_URL ?? env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    },
    docsConfig: {
      url:
        env.DOCS_ENDPOINT_URL ??
        env.NEXT_PUBLIC_DOCS_ENDPOINT_URL ??
        "https://control.onlaunch.app/api/docs",
    },
    sentryConfig: {
      enabled: parseBooleanEnvValueWithDefault(
        env.SENTRY_ENABLED ?? env.NEXT_PUBLIC_SENTRY_ENABLED,
        true,
      ),
      debug: parseBooleanEnvValueWithDefault(
        env.SENTRY_DEBUG ?? env.NEXT_PUBLIC_SENTRY_DEBUG,
        false,
      ),
      dsn: env.SENTRY_DSN ?? env.NEXT_PUBLIC_SENTRY_DSN,
      env: env.SENTRY_ENV ?? env.NEXT_PUBLIC_SENTRY_ENV,
      release: env.SENTRY_RELEASE ?? env.NEXT_PUBLIC_SENTRY_RELEASE,
      attachStacktrace: parseBooleanEnvValueWithDefault(
        env.SENTRY_ATTACH_STACKTRACE ??
          env.NEXT_PUBLIC_SENTRY_ATTACH_STACKTRACE,
        true,
      ),
      replaysOnErrorSampleRate: parseNumberEnvValue(
        env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ??
          env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
      ),
      replaysSessionSampleRate: parseNumberEnvValue(
        env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ??
          env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      ),
      sampleRate: parseNumberEnvValue(
        env.SENTRY_SAMPLE_RATE ?? env.NEXT_PUBLIC_SENTRY_SAMPLE_RATE,
      ),
      tracesSampleRate: parseNumberEnvValue(
        env.SENTRY_TRACES_SAMPLE_RATE ??
          env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
      ),
    },
    stripeConfig: {
      isEnabled:
        parseBooleanEnvValue(env.STRIPE_ENABLED) ??
        parseBooleanEnvValue(env.NEXT_PUBLIC_STRIPE_ENABLED) ??
        false,
    },
  };

  // we need to make sure keys are always in the same order to prevent "Text content did not match" issue
  // when displaying config on a page
  return sortKeys(
    adaptedConfig as unknown as { [keyof: string]: unknown },
  ) as unknown as ClientConfig;
}
