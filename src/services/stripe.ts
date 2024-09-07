import { loadServerConfig } from "@/config/loadServerConfig";
import Stripe from "stripe";

export function createStripeClient() {
  const stripeConfig = loadServerConfig().stripeConfig;

  if (!stripeConfig.secretKey) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(stripeConfig.secretKey, {
    apiVersion: "2024-06-20",
  });
}
