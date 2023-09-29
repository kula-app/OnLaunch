import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { loadConfig } from "../../../../../config/loadConfig";
import prisma from "../../../../../lib/services/db";
import { ProductType } from "../../../../../models/productType";
import Routes from "../../../../../routes/routes";
import { getUserWithRoleFromRequest } from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

interface SessionOptions {
  billing_address_collection: string;
  client_reference_id: string;
  line_items: {
    price: any;
    quantity: number;
  }[];
  mode: string;
  success_url: string;
  cancel_url: string;
  customer?: string;
}

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
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2023-08-16",
      });

      // check whether organisation has a stripe customer id with prisma
      const org = await prisma.organisation.findUnique({
        where: {
          id: userInOrg.orgId,
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

          const lineItem: any = {
            price: product.priceId,
          };

          // if quantity is provided, include it in the line item
          // note: metered prices do not get a quantity parameter
          if (product.hasOwnProperty("quantity")) {
            lineItem["quantity"] = product.quantity;
          }

          return lineItem;
        });

        let sessionOptions: SessionOptions = {
          billing_address_collection: "auto",
          client_reference_id: req.body.orgId as string,
          line_items: lineItems,
          mode: "subscription",
          success_url: `${config.nextAuth.url}${
            Routes.SUBSCRIPTION
          }?success=true&orgId=${req.body.orgId as string}`,
          cancel_url: `${config.nextAuth.url}${Routes.SUBSCRIPTION}?canceled=true`,
        };

        // if org already has a stripe id, add it to the options, else stripe will generate an id
        if (org && org.stripeCustomerId) {
          sessionOptions.customer = org.stripeCustomerId as string;
        }

        const session = await stripe.checkout.sessions.create(
          sessionOptions as any
        );

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
