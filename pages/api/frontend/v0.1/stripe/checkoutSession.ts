import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { loadConfig } from "../../../../../config/loadConfig";
import prisma from "../../../../../lib/services/db";
import { ProductType } from "../../../../../models/productType";
import Routes from "../../../../../routes/routes";
import { getUserWithRoleFromRequest } from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();
  const logger = new Logger(__filename);

  const userInOrg = await getUserWithRoleFromRequest(req, res);

  if (!userInOrg) {
    logger.error("User not logged in");
    return;
  }

  if (userInOrg.role !== "ADMIN") {
    logger.error("User has no admin rights");
    return;
  }

  switch (req.method) {
    case "POST":
      const stripe = new Stripe(config.stripeConfig.secretKey, {
        apiVersion: "2023-08-16",
      });

      // check whether organisation has a stripe customer id with prisma
      const org = await prisma.organisation.findUnique({
        where: {
          id: userInOrg.orgId,
          isDeleted: false,
        },
      });

      if (!org) {
        logger.error(`No organisation found with id ${userInOrg.orgId}`);
        return;
      }

      if (!req.body.products || !Array.isArray(req.body.products)) {
        logger.error("No parameter products provided");
        res
          .status(StatusCodes.BAD_REQUEST)
          .end("No parameter products provided");
      } else if (!req.body.orgId) {
        logger.error("No parameter orgId provided");
        res.status(StatusCodes.BAD_REQUEST).end("No parameter orgId provided");
      }

      try {
        logger.log("Creating checkout session for subscription");

        const lineItems = req.body.products.map((product: ProductType) => {
          // ensure that each product has a valid priceId
          if (!product.priceId) {
            throw new Error("Product is missing a priceId");
          }

          const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
            price: product.priceId,
          };

          if (!config.stripeConfig.useAutomaticTax) {
            if (config.stripeConfig.dynamicTaxRates) {
              lineItem.dynamic_tax_rates = config.stripeConfig.dynamicTaxRates;
            } else if (config.stripeConfig.taxRates) {
              lineItem.tax_rates = config.stripeConfig.taxRates;
            }
          }

          // if quantity is provided, include it in the line item
          // note: metered prices do not get a quantity parameter
          if (product.hasOwnProperty("quantity")) {
            lineItem["quantity"] = product.quantity;
          }

          return lineItem;
        });

        let sessionOptions: Stripe.Checkout.SessionCreateParams = {
          allow_promotion_codes: true,
          automatic_tax: { enabled: config.stripeConfig.useAutomaticTax },
          billing_address_collection: "required",
          client_reference_id: req.body.orgId,
          line_items: lineItems,
          mode: "subscription",
          success_url: Routes.subscriptionPageSuccess(req.body.orgId),
          cancel_url: Routes.subscriptionPageCancelled(),
          tax_id_collection: { enabled: true },
        };

        // if org already has a stripe id, add it to the options, else stripe will generate an id
        if (org && org.stripeCustomerId) {
          sessionOptions.customer = org.stripeCustomerId;
          sessionOptions.customer_update = {
            name: "auto",
          };
        }

        const session = await stripe.checkout.sessions.create(sessionOptions);

        logger.log("Redirecting to Stripe checkout");
        return res.json(session.url);
      } catch (error) {
        logger.error(`Error during Stripe communication: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
      }
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
