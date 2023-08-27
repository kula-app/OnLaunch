import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { loadConfig } from "../../../../../config/loadConfig";
import Stripe from "stripe";
import { reportOrgToStripe } from "../../../usageReport";

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
                `Error during checkout.session.completed (checkout id: ${session.id}) event: no subscription was retrieved`
              );
              res
                .status(StatusCodes.BAD_REQUEST)
                .end("no subscription was retrieved");
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

            const sub = session.subscription as Stripe.Subscription;

            const items = sub.items.data;
            const lastItem = items[items.length - 1];
            const subName = lastItem.price.nickname as string;

            // transform subscription items to database model
            const transformedItems = items.map((item) => {
              return {
                subItemId: item.id,
                metered: item.plan.aggregate_usage === "sum",
              };
            });

            const savedSub = await prisma.subscription.create({
              data: {
                subId: sub.id as string,
                subName: subName,
                orgId: Number(session.client_reference_id),
                subItems: {
                  create: [...transformedItems],
                },
                currentPeriodStart: new Date(sub.current_period_start * 1000),
                currentPeriodEnd: new Date(sub.current_period_end * 1000),
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
          // TO DO delete this code part
          //-----------------------------------
          const sub = event.data.object as Stripe.Subscription;
          // looking up whether subscription is already saved in database (for idempotency)
          const subFromDb = await prisma.subscription.findUnique({
            where: {
              subId: sub.id as string,
            },
          });

          // handle case when sub is already in the database
          if (subFromDb) {
            logger.log("Subscription is already in the database");
            break;
          }

          const items = sub.items.data;
          const lastItem = items[items.length - 1];
          const subName = lastItem.price.nickname as string;

          // transform subscription items to database model
          const transformedItems = items.map((item) => {
            return {
              subItemId: item.id,
              metered: item.plan.aggregate_usage === "sum",
            };
          });

          const savedSub = await prisma.subscription.create({
            data: {
              subId: sub.id as string,
              subName: subName,
              orgId: 6,
              subItems: {
                create: [...transformedItems],
              },
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });

          const updatedOrg = await prisma.organisation.updateMany({
            where: {
              id: 6,
              customer: null,
            },
            data: {
              customer: sub.customer as string,
            },
          });
          console.log("done");
          //-----------------------------------
          break;

        case "customer.subscription.deleted":
          logger.log("Customer subscription deleted!");
          const subData = event.data.object as Stripe.Subscription;
          try {
            const deletedSub = await prisma.subscription.update({
              where: {
                subId: subData.id,
              },
              data: {
                isDeleted: true,
              },
            });
          } catch (error) {
            logger.error(`Error: ${error}`);
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
                `No subscription found for sub id '${updatedSub.id}'`
              );
              break;
            }

            const stripeCurrentPeriodStart = new Date(
              updatedSub.current_period_start * 1000
            );
            const stripeCurrentPeriodEnd = new Date(
              updatedSub.current_period_end * 1000
            );

            console.log(`stripe start: ${stripeCurrentPeriodStart}`);
            console.log(`prisma start: ${updatedSubFromDb.currentPeriodStart}`);
            console.log(`stripe end: ${stripeCurrentPeriodEnd}`);
            console.log(`prisma end: ${updatedSubFromDb.currentPeriodEnd}`);
            // Check if new billing period started
            if (
              stripeCurrentPeriodStart.getTime() !==
                updatedSubFromDb.currentPeriodStart.getTime() ||
              stripeCurrentPeriodEnd.getTime() !==
                updatedSubFromDb.currentPeriodEnd.getTime()
            ) {
              // Report latest logged api requests to stripe
              logger.log(
                `New billing period started for org with id '${updatedSubFromDb.orgId}'`
              );
              await reportOrgToStripe(updatedSubFromDb.orgId);

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
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .end(`Error: ${error}`);
          }
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
