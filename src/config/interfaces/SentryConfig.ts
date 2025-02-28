export interface SentryConfig {
  isEnabled: boolean;
  debug: boolean;
  dsn: string | undefined;
  release: string | undefined;
  environment: string | undefined;
  attachStacktrace: boolean;
  replaysOnErrorSampleRate: number | undefined;
  replaysSessionSampleRate: number | undefined;
  sampleRate: number | undefined;
  profilesSampleRate: number | undefined;
  tracesSampleRate: number | undefined;
  anrThreshold: number | undefined;
}
