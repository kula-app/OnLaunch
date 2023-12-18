export interface StripeConfig {
  isEnabled: boolean;
  webhookSecret?: string;
  secretKey?: string;
  useAutomaticTax?: boolean;
  dynamicTaxRates?: Array<string>;
  taxRates?: Array<string>;
}
