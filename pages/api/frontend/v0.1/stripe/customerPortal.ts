import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { loadConfig } from "../../../../../config/loadConfig";
import Routes from "../../../../../routes/routes";
import { getUserWithRoleFromRequest } from "../../../../../util/auth";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
    logger.error("User not logged in");
    return;
  }

  if (!req.body.orgId) {
    logger.error("No parameter orgId provided");
    res
      .status(StatusCodes.BAD_REQUEST)
      .end("No parameter orgId provided");
  }

  switch (req.method) {
    case "POST":
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2023-08-16",
      });

      // check whether organisation has a stripe customer id with prisma
      const orgFromDb = await prisma.organisation.findUnique({
        where: {
          id: Number(req.body.orgId),
        },
      });

      if (!orgFromDb) {
        logger.error(`No org found with id ${req.body.orgId}`);
        return;
      }
      
      if (!orgFromDb.customer) {
        logger.error(`No stripe customer id found for organisation with id ${req.body.orgId}`);
        return;
      }

      try {
        logger.log("Creating customer portal session for organisation");
        const session = await stripe.billingPortal.sessions.create({
          customer: orgFromDb.customer,
          return_url: `${config.nextAuth.url}${Routes.DASHBOARD}`,
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
