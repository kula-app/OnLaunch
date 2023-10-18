export interface StripeConfig {
  apiVersion: string;
  webhookSecret: string;
  secretKey: string;
  useAutomaticTax: boolean;
  dynamicTaxRates?: Array<string>;
  taxRates?: Array<string>;
}
