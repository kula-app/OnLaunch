export interface SentryConfig {
  debug?: boolean;
  dsn?: string;
  env?: string;
  release?: string;
  replaysOnErrorSampleRate?: number;
  replaysSessionSampleRate?: number;
  sampleRate?: number;
  tracesSampleRate: number;
}
