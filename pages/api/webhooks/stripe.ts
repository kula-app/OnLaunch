import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { loadConfig } from "../../../config/loadConfig";
import prisma from "../../../lib/services/db";
import { Logger } from "../../../util/logger";
import { reportOrgToStripe } from "../../../util/stripe/reportUsage";

export const config = { api: { bodyParser: false } };

async function buffer(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(
      typeof chunk === "string"
        ? Buffer.from(chunk as string)
        : (chunk as Buffer)
    );
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const stripeConfig = loadConfig().server.stripeConfig;
  if (!stripeConfig.secretKey) {
    throw new Error("Stripe secret key is not configured");
  }
  const stripe = new Stripe(stripeConfig.secretKey, {
    apiVersion: "2023-08-16",
  });

  if (!stripeConfig.isEnabled) {
    logger.error("stripe is disabled but endpoint has been called");
    return res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ message: "Endpoint is disabled" });
  }

  switch (req.method) {
    case "POST":
      const buf = await buffer(req);
      const sig = req.headers["stripe-signature"];
      const webhookSecret = stripeConfig.webhookSecret;

      let event;

      try {
        if (!sig || !webhookSecret) {
          logger.error("Webhook secret not provided");
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "No signature or webhook secret provided" });
        }

        logger.log("Constructing stripe webhook event");
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
      } catch (error: any) {
        logger.error(`Stripe webhook error: ${error.message}`);
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `Stripe webhook error: ${error.message}` });
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
              return res.status(StatusCodes.BAD_REQUEST).json({
                message: `No client_reference_id in session`,
              });
            }

            if (!session.subscription) {
              logger.error(
                `Error during checkout.session.completed (checkout id: ${session.id}) event: no subscription was retrieved`
              );
              return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "no subscription was retrieved" });
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
              // for idempotency we just use a break-statement here and later return ok
              break;
            }

            const sub = session.subscription as Stripe.Subscription;

            const items = sub.items.data;
            const lastItem = items[items.length - 1];
            const subName = lastItem.price.nickname as string;

            // transform subscription items to database model
            const transformedItems = items.map((item) => {
              return {
                subItemId: item.id,
                metered: item.plan.aggregate_usage === "sum",
                productId: item.price.product as string,
              };
            });

            await prisma.subscription.create({
              data: {
                subId: sub.id as string,
                subName: subName ? subName : "loading",
                org: {
                  connect: { id: Number(session.client_reference_id) },
                },
                subItems: {
                  create: [...transformedItems],
                },
                currentPeriodStart: new Date(sub.current_period_start * 1000),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
              },
            });

            await prisma.organisation.updateMany({
              where: {
                id: Number(session.client_reference_id),
                stripeCustomerId: null,
                isDeleted: false,
              },
              data: {
                stripeCustomerId: session.customer as string,
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
          try {
            const toDeleteSubFromDb = await prisma.subscription.findUnique({
              where: {
                subId: subData.id,
              },
            });

            if (!toDeleteSubFromDb) {
              logger.error(
                `${event.type} - No subscription found for sub id '${subData.id}'`
              );
              return res.status(StatusCodes.BAD_REQUEST).json({
                message: `${event.type} - No subscription found for sub id '${subData.id}'`,
              });
            }

            await reportOrgToStripe(toDeleteSubFromDb.orgId, true);

            await prisma.subscription.update({
              where: {
                subId: subData.id,
              },
              data: {
                isDeleted: true,
              },
            });
          } catch (error) {
            logger.error(`Error: ${error}`);
            return res.status(StatusCodes.BAD_REQUEST).json({
              message: `${event.type} - error during deletion: ${error}`,
            });
          }
          break;

        case "customer.subscription.updated":
          logger.log("Customer subscription updated!");
          const updatedSub = event.data.object as Stripe.Subscription;
          try {
            const updatedSubFromDb = await prisma.subscription.findUnique({
              where: {
                subId: updatedSub.id,
              },
            });

            if (!updatedSubFromDb) {
              logger.error(
                `${event.type} - No subscription found for sub id '${updatedSub.id}'`
              );
              return res.status(StatusCodes.BAD_REQUEST).json({
                message: `${event.type} - No subscription found for sub id '${updatedSub.id}'`,
              });
            }

            // stripe timestamps are in seconds, while node handles them in miliseconds
            const stripeCurrentPeriodStart = new Date(
              updatedSub.current_period_start * 1000
            );
            const stripeCurrentPeriodEnd = new Date(
              updatedSub.current_period_end * 1000
            );

            // Check if new billing period started
            if (
              (stripeCurrentPeriodStart.getTime() !==
                updatedSubFromDb.currentPeriodStart.getTime() ||
                stripeCurrentPeriodEnd.getTime() !==
                  updatedSubFromDb.currentPeriodEnd.getTime()) &&
              !updatedSub.cancel_at_period_end
            ) {
              // Update new billing period information
              logger.log(
                `Updating new billing period information for sub with id '${updatedSub.id}`
              );
              await prisma.subscription.update({
                data: {
                  currentPeriodStart: stripeCurrentPeriodStart,
                  currentPeriodEnd: stripeCurrentPeriodEnd,
                },
                where: {
                  subId: updatedSub.id,
                },
              });
            }
          } catch (error) {
            logger.error(`Error: ${error}`);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: `An internal server error occurred, please try again later`,
            });
          }
          break;

        case "invoice.created":
          logger.log("Invoice created!");
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

      return res.status(StatusCodes.OK).end();

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
