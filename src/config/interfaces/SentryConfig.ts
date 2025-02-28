export interface SentryConfig {
  isEnabled: boolean;
  debug: boolean;
  dsn?: string;
  env?: string;
  release?: string;
  environment?: string;
  attachStacktrace?: boolean;
  replaysOnErrorSampleRate?: number;
  replaysSessionSampleRate?: number;
  sampleRate?: number;
  profilesSampleRate?: number;
  tracesSampleRate?: number;
  anrThreshold?: number;
}
