import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import { loadConfig } from "../../config/loadConfig";
import { Logger } from "../../util/logger";
import { getProducts } from "./frontend/v0.1/stripe/products";

const { v4: uuid } = require("uuid");
const prisma: PrismaClient = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

export async function reportOrgToStripe(orgId: number) {
  const logger = new Logger(__filename);
  logger.log(`Usage reporting called for org with id '${orgId}'`);

  // retrieve org data including the active subscription
  const orgFromDb = await prisma.organisation.findUnique({
    where: {
      id: orgId,
    },
    include: {
      subs: {
        where: {
          isDeleted: false,
        },
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

  if (orgFromDb && orgFromDb.apps) {
    // If there is no subscription in the database for the org,
    // do not process this any further
    if (orgFromDb.subs?.length === 0) {
      logger.log(`No sub(s) found for org with id '${orgId}'`);
      return;
    }

    // Looking for the first flatrate (unmetered) SubItem
    const flatrateSubItem = orgFromDb.subs[0].subItems.find(
      (subItem) => subItem.metered === false
    );

    if (!flatrateSubItem) {
      logger.log(`No flatrate sub item found for org with id '${orgId}'`);
      return;
    }

    // Looking for the first metered SubItem
    const meteredSubItem = orgFromDb.subs[0].subItems.find(
      (subItem) => subItem.metered === true
    );
    if (!meteredSubItem) {
      logger.log(`No metered sub item found for org with id '${orgId}'`);
      return;
    }

    let sumOfRequests = 0;
    // List of functions to execute later
    const operations: (() => Promise<any>)[] = [];

    // iterate through the apps of the organisation and map apps to promises
    for (const app of orgFromDb.apps) {
      try {
        // get latest request for counting and later saving request id
        const latestRequest = await prisma.loggedApiRequests.findFirst({
          where: {
            appId: app.id,
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
              gt: orgFromDb.subs[0].currentPeriodStart,
              lte: orgFromDb.subs[0].currentPeriodEnd,
            },
          },
        });

        sumOfRequests += requestCount;

        // Prepare the update operation without executing it
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
          `Error while preparing data for org with id '${orgId}': ${error}`
        );
        throw error;
      }
    }

    // Only proceed if there are new requests
    if (sumOfRequests > 0) {
      // Search for the last usage report of org
      const report = await prisma.loggedUsageReport.findFirst({
        where: {
          orgId: orgId,
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
        (report && orgFromDb.subs[0].currentPeriodStart > report.createdAt)
      ) {
        // Retrieve products to check request limit
        const products = JSON.parse(await getProducts());
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
            `The request count for org with id '${orgId}' is covered by the flatrate limit`
          );
          return;
        } else if (flatrateProduct.requests < sumOfRequests) {
          // Only a part of the request count is covered by the flatrate limit
          logger.log(
            `The request count for org with id '${orgId}' is partially covered by the flatrate limit`
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

        const endDate = new Date(orgFromDb.subs[0].currentPeriodEnd);
        const startDate = new Date(orgFromDb.subs[0].currentPeriodStart);
        
        if (currentDate > endDate) {
          console.log("TIMESTAMP IS endDate")
          //TODO usageData.timestamp = Math.floor(Date.now() / 1000) - 600 + 60 * 60 * 24 * 31;
          //usageData.timestamp = Math.floor(currentDate.getTime() / 1000) - 600;
          usageData.timestamp = Math.floor(endDate.getTime() / 1000);
        } else if (currentDate < startDate) {
          console.log("TIMESTAMP IS startDate")
          //TODO usageData.timestamp = Math.floor(Date.now() / 1000) - 600 + 60 * 60 * 24 * 31;
          //usageData.timestamp = Math.floor(currentDate.getTime() / 1000) - 600;
          usageData.timestamp = Math.ceil(startDate.getTime() / 1000) - 600;
        } else {
          console.log("TIMESTAMP IS OK")
          usageData.timestamp = Math.floor(currentDate.getTime() / 1000)
        }
        console.log("TIMESTAMP ===== " + usageData.timestamp)
        console.log("DATE ===== " + new Date(usageData.timestamp))

        logger.log(
          `Reporting usage of ${sumOfRequests} requests for org with id '${orgId}' and idempotency key '${idempotencyKey}' to stripe`
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
            orgId: orgId,
            requests: sumOfRequests,
          },
        });

        // If stripe call is successful, run all the prepared database update operations
        logger.log(`Updating apps for org with id '${orgId}' in a transaction`);
        await Promise.all(operations.map((op) => op()));
      } catch (error) {
        logger.error(
          `Cancelling reporting for org with id '${orgId}' due to error: ${error}`
        );
        throw error;
      }
    } else {
      logger.log(`No requests to report for org with id '${orgId}'`);
    }
  } else {
    logger.error(
      `Could not report usage for org with id '${orgId}' - org not found!`
    );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();
  const logger = new Logger(__filename);

  if (
    req.headers.authorization !== `Bearer ${config.usageReport.apiKey}` &&
    req.headers.authorization !== config.usageReport.apiKey
  ) {
    logger.error("Authorization of request failed - access denied!");
    return res.status(StatusCodes.FORBIDDEN).json({
      error: {
        message: "Access denied!",
      },
    });
  }

  switch (req.method) {
    case "POST":
      // If a specific orgId is provided, report the usage data for the
      // organisation with the orgId
      // This might occur when the billing period ends
      if (req.body.orgId) {
        try {
          await reportOrgToStripe(Number(req.body.orgId));

          res
            .status(StatusCodes.OK)
            .end(`Reported usage for org with id '${req.body.orgId}'`);
        } catch (error) {
          logger.error(`Error: ${error}`);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .end("Error during reporting usage, please try again later!");
        }
      }

      // In case no specific orgId is provided, do the (periodic) reporting
      // for all orgs
      if (!req.body.orgId) {
        try {
          const orgsFromDb = await prisma.organisation.findMany();

          // sequentially report the usage of all orgs
          logger.log("Running usage reports for all organisations");

          for (const org of orgsFromDb) {
            try {
              await reportOrgToStripe(org.id);
            } catch (error) {
              logger.error(`${error}`);
            }
          }

          res
            .status(StatusCodes.OK)
            .end("Reported usage for all organisations");
        } catch (error) {
          // If either prisma throws an error, it is assumed that all the other
          // reports will fail as well, thus returning an error instead of proceeding
          logger.error(`Error: ${error}`);
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .end("Error during reporting usage, please try again later!");
        }
      }

      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
