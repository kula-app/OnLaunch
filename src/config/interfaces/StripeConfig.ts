export interface StripeConfig {
  isEnabled: boolean;
  webhookSecret?: string;
  secretKey?: string;
  useAutomaticTax?: boolean;
  taxRates?: Array<string>;
  meterEventName?: string;
}
