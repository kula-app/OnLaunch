import Stripe from "stripe";
import { loadServerConfig } from "../../config/loadServerConfig";

export function createStripeClient() {
  const stripeConfig = loadServerConfig().stripeConfig;

  if (!stripeConfig.secretKey) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(stripeConfig.secretKey, {
    apiVersion: "2023-10-16",
  });
}
