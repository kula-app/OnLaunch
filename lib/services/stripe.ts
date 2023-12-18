import Stripe from "stripe";
import { loadConfig } from "../../config/loadConfig";

export function createStripeClient() {
  const stripeConfig = loadConfig().server.stripeConfig;

  if (!stripeConfig.secretKey) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(stripeConfig.secretKey, {
    apiVersion: "2023-10-16",
  });
}
