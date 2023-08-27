import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { PrismaClient, PrismaPromise } from "@prisma/client";
import { loadConfig } from "../../config/loadConfig";
import { Logger } from "../../util/logger";

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
          subItems: {
            where: {
              metered: true,
            },
          },
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
    let sumOfRequests = 0;
    // List of functions to execute later
    const operations: (() => Promise<any>)[] = [];

    // iterate through the apps of the organisation and map apps to promises
    for (const app of orgFromDb.apps) {
      try {
        // If there is no subscription in the database for the org, throw error
        if (orgFromDb.subs.length === 0) {
          logger.error(`No sub(s) found for org with id '${orgId}'`);
          throw new Error(`No sub(s) found for org with id '${orgId}'`);
        }

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
              gte: orgFromDb.subs[0].currentPeriodStart,
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

    if (sumOfRequests > 0) {
      // the idempotency key makes sure the same request is not
      // applied twice
      const idempotencyKey = uuid();

      try {
        logger.log(
          `Reporting usage of ${sumOfRequests} requests for org with id '${orgId}' and idempotency key '${idempotencyKey}' to stripe`
        );
        // The default 'action' is 'increment'
        // If no timestamp is provided, stripe adds the timestamp to the record
        await stripe.subscriptionItems.createUsageRecord(
          orgFromDb.subs[0].subItems[0].subItemId,
          {
            quantity: sumOfRequests,
          },
          {
            idempotencyKey,
          }
        );

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

  // to do delete bearer ?
  if (req.headers.authorization !== `Bearer ${config.usageReport.apiKey}`) {
    logger.error("Authorization of request failed - access denied!");
    return res.status(StatusCodes.FORBIDDEN).json({
      error: {
        message: "Access denied!",
      },
    });
  }

  switch (req.method) {
    case "POST":
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-11-15",
      });

      // if a specific orgId is provided, report the usage data for the
      // organisation with the orgId
      // this might occur when the billing period ends
      if (req.body.orgId) {
        try {
          await reportOrgToStripe(Number(req.body.orgId));

          res
            .status(StatusCodes.OK)
            .end(`Reported usage for org with id '${req.body.orgId}'`);
        } catch (error) {
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .end("Error during reporting usage, please try again later!");
        }
      }
      // in case no specific orgId is provided, do the periodic reporting
      // for all orgs
      if (!req.body.orgId) {
        // to do
      }

      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
