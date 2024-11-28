import type { DocsConfig } from "./docs-config";
import { SentryConfig } from "./SentryConfig";
import { StripeConfig } from "./StripeConfig";

export interface ClientConfig {
  docsConfig: DocsConfig;
  sentryConfig: SentryConfig;
  stripeConfig: StripeConfig;
}
