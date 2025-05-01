import type { ClientBaseConfig } from "./client-base-config";
import type { DocsConfig } from "./docs-config";
import { SentryConfig } from "./SentryConfig";
import { StripeConfig } from "./StripeConfig";

export interface ClientConfig {
  baseConfig: ClientBaseConfig;
  docsConfig: DocsConfig;
  sentryConfig: SentryConfig;
  stripeConfig: StripeConfig;
}
