export interface SentryConfig {
  enabled: boolean;
  debug: boolean;
  dsn?: string;
  env?: string;
  release?: string;
  attachStacktrace?: boolean;
  replaysOnErrorSampleRate?: number;
  replaysSessionSampleRate?: number;
  sampleRate?: number;
  profilesSampleRate?: number;
  tracesSampleRate?: number;
  anrThreshold?: number;
}
