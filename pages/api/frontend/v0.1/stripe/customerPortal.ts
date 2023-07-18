import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { loadConfig } from "../../../../../config/loadConfig";
import Routes from "../../../../../routes/routes";
import { getUserFromRequest } from "../../../../../util/auth";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();
  const logger = new Logger(__filename);

  const user = await getUserFromRequest(req, res);

  if (!user) {
    logger.error("User not logged in");
    return;
  }

  switch (req.method) {
    case "POST":
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-11-15",
      });

      // check whether user has a stripe customer id with prisma
      const userFromDb = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (!userFromDb) {
        logger.error(`No user found with id ${user.id}`);
        return;
      }
      
      if (!userFromDb.customer) {
        logger.error(`No stripe customer id found for user with id ${user.id}`);
        return;
      }

      try {
        logger.log("Creating customer portal session for user");
        const session = await stripe.billingPortal.sessions.create({
          customer: userFromDb.customer,
          return_url: `${config.nextAuth.url}${Routes.PROFILE}`,
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
