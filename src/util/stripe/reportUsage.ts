import { Product } from "@/models/product";
import { getProducts } from "@/pages/api/frontend/v0.1/stripe/products";
import prisma from "@/services/db";
import { createStripeClient } from "@/services/stripe";
import { Logger } from "../logger";

async function findProductDetailsById(id: string, products: any) {
  const product = products.find(
    (p: Product) =>
      p.id === id || (p.unlimitedOption && p.unlimitedOption.id === id),
  );

  if (!product) {
    return null;
  }

  if (product.id === id) {
    return { priceAmount: product.priceAmount };
  }

  if (product.unlimitedOption && product.unlimitedOption.id === id) {
    return {
      priceAmount: product.unlimitedOption.priceAmount,
    };
  }

  return null;
}

export async function reportOrgToStripe(
  orgId: number,
  isSubscriptionDeleted: boolean,
) {
  const logger = new Logger(__filename);
  logger.log(`Usage reporting called for org with id '${orgId}'`);

  const stripe = createStripeClient();

  // Retrieve org data including the active subscription and subItems
  const org = await prisma.organisation.findFirst({
    where: {
      id: orgId,
      isDeleted: false,
      subs: {
        // This is a nested "some" condition.
        // It filters organisation to have at least one subItem with metered = true
        // and at least one with metered = false
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

  if (!org) {
    logger.log(
      `No organisation found with id '${orgId}' (with metered, active subscription)`,
    );
    throw new Error(
      `No organisation found with id '${orgId}' (with metered, active subscription)`,
    );
  }

  // Retrieve products to check request limit
  const products = await getProducts();

  // Looking for the first flatrate (unmetered) SubItem
  const flatrateSubItem = org.subs[0].subItems.find(
    (subItem) => subItem.metered === false,
  );
  if (!flatrateSubItem) {
    logger.log(`No flatrate sub item found for org with id '${org.id}'`);
    return;
  }

  // Looking for the first metered SubItem
  const meteredSubItem = org.subs[0].subItems.find(
    (subItem) => subItem.metered === true,
  );
  if (!meteredSubItem) {
    logger.log(`No metered sub item found for org with id '${org.id}'`);
    return;
  }

  let sumOfRequests = 0;

  let latestRequestIdPerApp: {
    appId: number;
    latestRequestId?: number;
  }[] = [];

  // iterate through the apps of the organisation and map apps to promises
  for (const app of org.apps) {
    try {
      // TODO: merge this lookup with the query above using `include`
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
      latestRequestIdPerApp.push({
        appId: app.id,
        latestRequestId: latestRequest?.id,
      });
    } catch (error) {
      logger.error(
        `Error while preparing data for org with id '${org.id}': ${error}`,
      );
      throw error;
    }
  }

  // Only proceed if there are new requests
  if (sumOfRequests == 0) {
    logger.log(`No requests to report for org with id '${org.id}'`);
    return;
  }

  // Search for the last usage report of org
  const report = await prisma.loggedUsageReport.findFirst({
    where: {
      orgId: org.id,
      createdAt: {
        gte: org.subs[0].currentPeriodStart,
        lte: org.subs[0].currentPeriodEnd,
      },
      isReportedAsInvoice: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If there is no usage report for the org during the current
  // billing period, check if the sum of requests exceeds the
  // requests covered by the flatrate subscription
  if (!report) {
    const flatrateProduct = products.find(
      (product: { id: string | undefined }) =>
        product.id === flatrateSubItem.productId,
    );

    if (!flatrateProduct) {
      logger.error(
        `Could not find flatrate product with id '${flatrateSubItem.productId}'`,
      );
      throw new Error(
        `Could not find flatrate product with id '${flatrateSubItem.productId}'`,
      );
    }
    const requests = flatrateProduct.requests ?? 0;

    // Check if the requests during this billing period exceed the limit
    if (requests >= sumOfRequests) {
      logger.log(
        `The request count for org with id '${org.id}' is covered by the flatrate limit`,
      );
      return;
    } else if (requests < sumOfRequests) {
      // Only a part of the request count is covered by the flatrate limit
      logger.log(
        `The request count for org with id '${org.id}' is partially covered by the flatrate limit`,
      );
      // Substract the flatrate limit for the (first) usage report for this billing period
      sumOfRequests = sumOfRequests - requests;
    }
  }

  // If subscription is not deleted, report usage to stripe
  if (!isSubscriptionDeleted) {
    logger.log(
      `Reporting usage of ${sumOfRequests} requests for org with id '${org.id}' to stripe`,
    );
    await stripe.subscriptionItems.createUsageRecord(meteredSubItem.subItemId, {
      quantity: sumOfRequests,
    });

    await prisma.loggedUsageReport.create({
      data: {
        orgId: org.id,
        requests: sumOfRequests,
        isReportedAsInvoice: false,
      },
    });
  } else {
    try {
      // Search product for pricing data
      const product = await findProductDetailsById(
        meteredSubItem.productId,
        products,
      );

      if (!product) {
        logger.error(
          `Could not find procuct with id '${meteredSubItem.productId}`,
        );
        return;
      }

      // Calculating the amount to pay in cents (for graduated pricing)
      // Since the priceAmount should be in EUR, multiply it by 100 to
      // get the amount in cents
      const amount = Math.round(
        sumOfRequests * (Number(product.priceAmount) * 100),
      );

      if (amount <= 0) {
        logger.log(
          `${sumOfRequests} requests for org '${
            org.id
          }' result in not even 1 cent (${
            sumOfRequests * (Number(product.priceAmount) * 100)
          }) - no invoice item to create`,
        );
        return;
      }
      logger.log(
        `Creating new invoice item to report usage of ${sumOfRequests} requests (${amount} eur-cents) for org with id '${org.id}' (customer id: ${org.stripeCustomerId}) to stripe`,
      );

      // Create new invoice item to account for the requests made in the
      // end of the billing
      await stripe.invoiceItems.create({
        customer: org.stripeCustomerId as string,
        amount: amount,
        description: `Last usage for ${org.subs[0].subName}`,
        currency: "eur",
        period: {
          start: org.subs[0].currentPeriodStart.getTime() / 1000,
          end: org.subs[0].currentPeriodEnd.getTime() / 1000,
        },
      });

      await prisma.loggedUsageReport.create({
        data: {
          orgId: org.id,
          requests: sumOfRequests,
          isReportedAsInvoice: true,
        },
      });
    } catch (error) {
      logger.error(
        `Cancelling reporting for org with id '${org.id}' due to error: ${error}`,
      );
      throw error;
    }
  }

  // If stripe call is successful, run all the prepared database update operations
  logger.log(`Updating apps for org with id '${org.id}' in a transaction`);
  for (const op of latestRequestIdPerApp) {
    await prisma.app.update({
      data: {
        idOfLastReportedApiRequest: op.latestRequestId,
      },
      where: {
        id: op.appId,
      },
    });
  }
}
