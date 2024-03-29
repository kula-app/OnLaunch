import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { loadConfig } from "../../../../../config/loadConfig";
import prisma from "../../../../../lib/services/db";
import { createStripeClient } from "../../../../../lib/services/stripe";
import Routes from "../../../../../routes/routes";
import { getUserWithRoleFromRequest } from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();
  const logger = new Logger(__filename);

  if (!config.server.stripeConfig.isEnabled) {
    logger.error("stripe is disabled but endpoint has been called");
    return res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ message: "Endpoint is disabled" });
  }

  const user = await getUserWithRoleFromRequest(req, res);

  if (!user) {
    return;
  }

  const orgId = req.body.orgId;

  if (!orgId) {
    logger.error("No parameter orgId provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No parameter orgId provided" });
  }

  switch (req.method) {
    case "POST":
      const stripe = createStripeClient();

      // check whether organisation has a stripe customer id with prisma
      const orgFromDb = await prisma.organisation.findUnique({
        where: {
          id: orgId,
          isDeleted: false,
        },
      });

      if (!orgFromDb) {
        logger.error(`No org found with id ${orgId}`);
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No organisation found with id ${orgId}`,
        });
      }

      if (!orgFromDb.stripeCustomerId) {
        logger.error(
          `No stripe customer id found for organisation with id ${orgId}`
        );
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No stripe customer id found for organisation with id ${orgId}`,
        });
      }

      try {
        logger.log("Creating customer portal session for organisation");
        const session = await stripe.billingPortal.sessions.create({
          customer: orgFromDb.stripeCustomerId,
          return_url: `${config.server.nextAuth.url}${Routes.DASHBOARD}`,
        });

        logger.log("Redirecting to Stripe customer portal");
        return res.json(session.url);
      } catch (error) {
        logger.error(`Error during Stripe communication: ${error}`);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json("An internal server error occurred, please try again later");
      }

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
