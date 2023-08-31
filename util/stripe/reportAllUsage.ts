import { PrismaClient } from "@prisma/client";
import { Logger } from "../logger";
import { getProducts } from "../../pages/api/frontend/v0.1/stripe/products";
import Stripe from "stripe";

const { v4: uuid } = require("uuid");
const prisma: PrismaClient = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
});

export async function reportAllOrgsToStripe() {
  const logger = new Logger(__filename);
  logger.log(`Usage reporting called for all orgs`);

  // retrieve orgs data including the active subscriptions and subItems
  const orgs = await prisma.organisation.findMany({
    where: {
      subs: {
        // This is a nested "some" condition.
        // It filters organisations that have at least one subItem with metered = true
        some: {
          AND: [
            { isDeleted: false },
            {
              subItems: {
                some: {
                  metered: true,
                },
              },
            },
            {
              subItems: {
                some: {
                  metered: false,
                },
              },
            },
          ],
        },
      },
    },
    include: {
      subs: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          subItems: true,
        },
      },
      apps: {
        select: {
          id: true,
          idOfLastReportedApiRequest: true,
        },
      },
    },
  });

  if (!orgs || orgs.length === 0) {
    logger.log("No organisations found to report");
    return;
  }
  logger.log(
    `Found this many organisations to report usage for: ${orgs.length}`
  );

  // Retrieve products to check request limit
  const products = JSON.parse(await getProducts());

  orgs.forEach(async (org) => {
    // Looking for the first flatrate (unmetered) SubItem
    const flatrateSubItem = org.subs[0].subItems.find(
      (subItem) => subItem.metered === false
    );
    if (!flatrateSubItem) {
      logger.log(`No flatrate sub item found for org with id '${org.id}'`);
      return;
    }

    // Looking for the first metered SubItem
    const meteredSubItem = org.subs[0].subItems.find(
      (subItem) => subItem.metered === true
    );
    if (!meteredSubItem) {
      logger.log(`No metered sub item found for org with id '${org.id}'`);
      return;
    }

    let sumOfRequests = 0;

    // List of functions to execute later
    const operations: (() => Promise<any>)[] = [];

    // iterate through the apps of the organisation and map apps to promises
    for (const app of org.apps) {
      try {
        // get latest request for counting and later saving request id
        const latestRequest = await prisma.loggedApiRequests.findFirst({
          where: {
            appId: app.id,
            createdAt: {
              gt: org.subs[0].currentPeriodStart,
              lte: org.subs[0].currentPeriodEnd,
            },
          },
          orderBy: {
            id: "desc",
          },
        });

        const requestCount = await prisma.loggedApiRequests.count({
          where: {
            appId: app.id,
            id: {
              gt: app.idOfLastReportedApiRequest
                ? app.idOfLastReportedApiRequest
                : 0,
              lte: latestRequest?.id,
            },
            // The main identifier for api requests to report is the idOfLastReportedApiRequest
            // However, by using the period start and end as constraints, it is made sure
            // that unreported api requests (e.g. requests during the free abo), will not be
            // be reported for later subscriptions
            createdAt: {
              gt: org.subs[0].currentPeriodStart,
              lte: org.subs[0].currentPeriodEnd,
            },
          },
        });

        sumOfRequests += requestCount;

        // Prepare the update operations without executing it, to
        // execute it after successfully transmitting the
        // sumOfRequests to stripe
        operations.push(() =>
          prisma.app.update({
            data: {
              idOfLastReportedApiRequest: latestRequest?.id,
            },
            where: {
              id: app.id,
            },
          })
        );
      } catch (error) {
        logger.error(
          `Error while preparing data for org with id '${org.id}': ${error}`
        );
        throw error;
      }
    }

    // Only proceed if there are new requests
    if (sumOfRequests > 0) {
      // Search for the last usage report of org
      const report = await prisma.loggedUsageReport.findFirst({
        where: {
          orgId: org.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // If there is no usage report so far for the org or when there has not
      // been a report during the current billing period, check if the sum
      // of requests exceeds the requests covered by the flatrate subscription
      if (
        !report ||
        (report && org.subs[0].currentPeriodStart > report.createdAt)
      ) {
        const flatrateProduct = products.find(
          (product: { id: string | undefined }) =>
            product.id === flatrateSubItem.productId
        );

        if (!flatrateProduct) {
          logger.error(
            `Could not find flatrate product with id '${flatrateSubItem.productId}'`
          );
          throw new Error(
            `Could not find flatrate product with id '${flatrateSubItem.productId}'`
          );
        }

        // Check if the requests during this billing period exceed the limit
        if (flatrateProduct.requests >= sumOfRequests) {
          logger.log(
            `The request count for org with id '${org.id}' is covered by the flatrate limit`
          );
          return;
        } else if (flatrateProduct.requests < sumOfRequests) {
          // Only a part of the request count is covered by the flatrate limit
          logger.log(
            `The request count for org with id '${org.id}' is partially covered by the flatrate limit`
          );
          // Substract the flatrate limit for the (first) usage report for this billing period
          sumOfRequests = sumOfRequests - flatrateProduct.requests;
        }
      }

      // The idempotency key makes sure the same request is not
      // applied twice
      const idempotencyKey = uuid();

      try {
        const usageData: any = {
          quantity: sumOfRequests,
        };

        // If this reporting is at the end of the billing period,
        // set the timestamp 10 minutes back or else stripe
        // will reject the usage record (if the current timestamp
        // is bigger than stripe's current timestamp) or stripe
        // will count the usage report to the new billing period
        const currentDate = new Date();
        // TODO currentDate.setMonth(currentDate.getMonth() + 1);
        //currentDate.setMonth(currentDate.getMonth() + 1);
        //currentDate.setMinutes(currentDate.getMinutes() + 10);

        const endDate = new Date(org.subs[0].currentPeriodEnd);
        endDate.setSeconds(endDate.getSeconds() - 10);
        const startDate = new Date(org.subs[0].currentPeriodStart);

        if (currentDate > endDate) {
          console.log("TIMESTAMP IS endDate");
          //TODO usageData.timestamp = Math.floor(Date.now() / 1000) - 600 + 60 * 60 * 24 * 31;
          //usageData.timestamp = Math.floor(currentDate.getTime() / 1000) - 600;
          usageData.timestamp = Math.floor(endDate.getTime() / 1000);
        } else if (currentDate < startDate) {
          console.log("TIMESTAMP IS startDate");
          //TODO usageData.timestamp = Math.floor(Date.now() / 1000) - 600 + 60 * 60 * 24 * 31;
          //usageData.timestamp = Math.floor(currentDate.getTime() / 1000) - 600;
          usageData.timestamp = Math.ceil(startDate.getTime() / 1000);
        } else {
          console.log("TIMESTAMP IS OK");
          usageData.timestamp = Math.floor(currentDate.getTime() / 1000);
        }
        console.log("TIMESTAMP ===== " + usageData.timestamp);
        console.log("DATE ===== " + new Date(usageData.timestamp * 1000));

        logger.log(
          `Reporting usage of ${sumOfRequests} requests for org with id '${org.id}' and idempotency key '${idempotencyKey}' to stripe`
        );
        // The default 'action' is 'increment'
        // If no timestamp is provided, stripe adds the timestamp to the record
        await stripe.subscriptionItems.createUsageRecord(
          meteredSubItem.subItemId,
          usageData,
          {
            idempotencyKey,
          }
        );

        await prisma.loggedUsageReport.create({
          data: {
            orgId: org.id,
            requests: sumOfRequests,
          },
        });

        // If stripe call is successful, run all the prepared database update operations
        logger.log(
          `Updating apps for org with id '${org.id}' in a transaction`
        );
        await Promise.all(operations.map((op) => op()));
      } catch (error) {
        logger.error(
          `Cancelling reporting for org with id '${org.id}' due to error: ${error}`
        );
        throw error;
      }
    } else {
      logger.log(`No requests to report for org with id '${org.id}'`);
    }
  });
}
