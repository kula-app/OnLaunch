import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { loadConfig } from "../../../../../config/loadConfig";
import Stripe from "stripe";

const prisma: PrismaClient = new PrismaClient();

export const config = { api: { bodyParser: false } };

async function buffer(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const nextConfig = loadConfig();
  const stripe = new Stripe(nextConfig.stripeConfig.secretKey, {
    apiVersion: "2022-11-15",
  });

  switch (req.method) {
    case "POST":
      const buf = await buffer(req);
      const sig = req.headers["stripe-signature"];
      const webhookSecret = nextConfig.stripeConfig.webhookSecret;

      let event;

      try {
        if (!sig || !webhookSecret) return;

        logger.log("Constructing stripe webhook event");
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
      } catch (error: any) {
        logger.error(`Stripe webhook error: ${error.message}`);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .end(`Stripe webhook error: ${error.message}`);
      }

      logger.log(`Event: ${JSON.stringify(event)}`);
      logger.log(`Event type: ${event.type}`);

      switch (event.type) {
        case "payment_intent.succeeded":
          logger.log("Payment succeeded!");
          break;
        case "payment_intent.payment_failed":
          logger.error("Payment failed!");
          break;
        case "customer.created":
          logger.log("Customer created!");
          logger.log(
            `Customer data: id=${event.data.object.id}, name=${event.data.object.name}, email=${event.data.object.email}`
          );
          break;
        case "customer.subscription.created":
          logger.log("Customer subscription created!");
          break;
        case "product.created":
          logger.log("Product created!");
          break;
        case "product.deleted":
          logger.log("Product deleted!");
          break;
        case "product.updated":
          logger.log("Product updated!");
          break;
      }

      res.status(StatusCodes.OK).end();
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
