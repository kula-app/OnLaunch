import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { loadConfig } from "../../../../../config/loadConfig";
import prisma from "../../../../../lib/services/db";
import Routes from "../../../../../routes/routes";
import { getUserWithRoleFromRequest } from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res);

  if (!user) {
    logger.error("User not logged in");
    return;
  }

  const orgId = req.body.orgId;

  if (!orgId) {
    logger.error("No parameter orgId provided");
    res.status(StatusCodes.BAD_REQUEST).end("No parameter orgId provided");
  }

  switch (req.method) {
    case "POST":
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2023-08-16",
      });

      // check whether organisation has a stripe customer id with prisma
      const orgFromDb = await prisma.organisation.findUnique({
        where: {
          id: orgId,
          isDeleted: false,
        },
      });

      if (!orgFromDb) {
        logger.error(`No org found with id ${orgId}`);
        return;
      }

      if (!orgFromDb.stripeCustomerId) {
        logger.error(
          `No stripe customer id found for organisation with id ${orgId}`
        );
        return;
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
      }
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
