import { SentryConfig } from "./SentryConfig";
import { StripeConfig } from "./StripeConfig";

export interface ClientConfig {
  sentryConfig: SentryConfig;
  stripeConfig: StripeConfig;
}
