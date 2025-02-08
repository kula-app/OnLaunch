import { StripeConfig } from "@/config/interfaces/StripeConfig";
import { loadServerConfig } from "@/config/loadServerConfig";
import type { Org } from "@/models/org";
import { OrgUser } from "@/models/org-user";
import { ProductType } from "@/models/productType";
import Routes from "@/routes/routes";
import prisma from "@/services/db";
import { createStripeClient } from "@/services/stripe";
import { authenticatedUserWithRoleHandler } from "@/util/authenticatedHandler";
import { Logger } from "@/util/logger";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return authenticatedUserWithRoleHandler(req, res, async (req, res, user) => {
    const stripeConfig = loadServerConfig().stripeConfig;

    if (!stripeConfig.isEnabled) {
      logger.error("Stripe is disabled but endpoint has been called");
      return res
        .status(StatusCodes.SERVICE_UNAVAILABLE)
        .json({ message: "Endpoint is disabled" });
    }

    if (user.role !== "ADMIN") {
      logger.error("User has no admin rights");
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "You are not an admin" });
    }

    switch (req.method) {
      case "POST":
        return postHandler(req, res, user, stripeConfig);

      default:
        return res
          .status(StatusCodes.METHOD_NOT_ALLOWED)
          .json({ message: "Method not allowed" });
    }
  });
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: OrgUser & {
    orgId: Org["id"];
  },
  stripeConfig: StripeConfig,
) {
  const config = loadServerConfig();
  const stripe = createStripeClient();

  // check whether organisation has a stripe customer id with prisma
  const org = await prisma.organisation.findUnique({
    where: {
      id: user.orgId,
      isDeleted: false,
    },
  });

  if (!org) {
    logger.error(`No organisation found with id ${user.orgId}`);
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `No organisation found with id ${user.orgId}`,
    });
  }

  if (!req.body.products || !Array.isArray(req.body.products)) {
    logger.error("No parameter products provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No parameter products provided" });
  } else if (!req.body.orgId) {
    logger.error("No parameter orgId provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No parameter orgId provided" });
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

      if (!stripeConfig.useAutomaticTax) {
        if (stripeConfig.dynamicTaxRates) {
          lineItem.dynamic_tax_rates = stripeConfig.dynamicTaxRates;
        } else if (stripeConfig.taxRates) {
          lineItem.tax_rates = stripeConfig.taxRates;
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
      automatic_tax: {
        enabled: !!stripeConfig.useAutomaticTax,
      },
      billing_address_collection: "required",
      client_reference_id: req.body.orgId,
      line_items: lineItems,
      mode: "subscription",
      success_url: Routes.subscriptionPageSuccess(req.body.orgId),
      cancel_url: Routes.subscriptionPageCancelled({
        baseUrl: config.baseConfig.url,
      }),
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
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
}
