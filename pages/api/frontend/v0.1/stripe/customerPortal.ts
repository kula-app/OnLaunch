import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { ServerConfig } from "../../../../../config/interfaces/ServerConfig";
import { loadServerConfig } from "../../../../../config/loadServerConfig";
import prisma from "../../../../../lib/services/db";
import { createStripeClient } from "../../../../../lib/services/stripe";
import { User } from "../../../../../models/user";
import Routes from "../../../../../routes/routes";
import { authenticatedHandler } from "../../../../../util/authenticatedHandler";
import { Logger } from "../../../../../util/logger";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
  return authenticatedHandler(
    req,
    res,
    { method: "withRole" },
    async (req, res, user) => {
      const config = loadServerConfig();

      if (!config.stripeConfig.isEnabled) {
        logger.error("stripe is disabled but endpoint has been called");
        return res
          .status(StatusCodes.SERVICE_UNAVAILABLE)
          .json({ message: "Endpoint is disabled" });
      }

      switch (req.method) {
        case "POST":
          return postHandler(req, res, user, config);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "Method not allowed" });
      }
    }
  );
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
  config: ServerConfig
) {
  const orgId = req.body.orgId;

  if (!orgId) {
    logger.error("No parameter orgId provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No parameter orgId provided" });
  }

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
      return_url: `${config.nextAuth.url}${Routes.DASHBOARD}`,
    });

    logger.log("Redirecting to Stripe customer portal");
    return res.json(session.url);
  } catch (error) {
    logger.error(`Error during Stripe communication: ${error}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json("An internal server error occurred, please try again later");
  }
}
