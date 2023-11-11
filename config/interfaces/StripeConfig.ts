export interface StripeConfig {
  isEnabled: boolean;
  apiVersion: string;
  webhookSecret: string;
  secretKey: string;
  useAutomaticTax: boolean;
  dynamicTaxRates?: Array<string>;
  taxRates?: Array<string>;
}
