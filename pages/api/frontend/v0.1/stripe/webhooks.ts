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

      logger.log(`Event type: ${event.type}`);

      switch (event.type) {
        case "customer.created":
          logger.log("Customer created!");
          const eventData = event.data.object as Stripe.Customer;
          break;
          
        case "checkout.session.completed":
          logger.log("Checkout session completed!");
          const sessionData = event.data.object as Stripe.Checkout.Session;

          try {
            const session = await stripe.checkout.sessions.retrieve(
              sessionData.id,
              {
                expand: ["subscription"],
              }
            );

            if (!session.client_reference_id) {
              logger.error(
                `Error during checkout.session.completed (checkout id: ${session.id}) event: no client_reference_id in session`
              );
              break;
            }

            if (!session.subscription) {
              logger.error(
                `Error during checkout.session.completed (checkout id: ${session.id}) event: no subscription could have been retrieved yet`
              );
              break;
            }

            // looking up whether subscription is already saved in database (for idempotency)
            const subFromDb = await prisma.subscription.findUnique({
              where: {
                subId: (session.subscription as Stripe.Subscription)
                  .id as string,
              },
            });

            // handle case when sub is already in the database
            if (subFromDb) {
              logger.log("Subscription is already in the database");
              break;
            }

            const savedSub = await prisma.subscription.create({
              data: {
                subId: (session.subscription as Stripe.Subscription)
                  .id as string,
                subName: (session.subscription as Stripe.Subscription).items
                  .data[0].price.nickname as string,
                orgId: Number(session.client_reference_id),
              },
            });

            const updatedOrg = await prisma.organisation.updateMany({
              where: {
                id: Number(session.client_reference_id),
                customer: null,
              },
              data: {
                customer: session.customer as string,
              },
            });
          } catch (error) {
            logger.error(
              `Error during checkout.session.completed event: ${error}`
            );
          }
          break;

        case "customer.subscription.created":
          logger.log("Customer subscription created!");
          break;

        case "customer.subscription.deleted":
          logger.log("Customer subscription deleted!");
          const subData = event.data.object as Stripe.Subscription;
          const deletedSub = await prisma.subscription.update({
            where: {
              subId: subData.id,
            },
            data: {
              isDeleted: true,
            },
          });
          break;

        case "payment_intent.payment_failed":
          logger.error("Payment failed!");
          break;

        case "payment_intent.succeeded":
          logger.log("Payment succeeded!");
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
