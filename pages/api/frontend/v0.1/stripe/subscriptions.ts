import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { loadConfig } from "../../../../../config/loadConfig";
import Routes from "../../../../../routes/routes";
import { getUserFromRequest } from "../../../../../util/auth";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

interface SessionOptions {
  billing_address_collection: string;
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

      if (!req.body.priceId) {
        logger.error("No parameter priceId provided");
        res
          .status(StatusCodes.BAD_REQUEST)
          .end("No parameter priceId provided");
      } else if (!req.body.orgName) {
        logger.error("No parameter orgName provided");
        res
          .status(StatusCodes.BAD_REQUEST)
          .end("No parameter orgName provided");
      }

      try {
        logger.log("Creating checkout session for subscription");
        let sessionOptions: SessionOptions = {
          billing_address_collection: "auto",
          line_items: [
            {
              price: req.body.priceId,
              // for metered billing, do not pass quantity
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${config.nextAuth.url}${Routes.SUBSCRIPTION}?session_id={CHECKOUT_SESSION_ID}&org_name=${req.body.orgName}`,
          cancel_url: `${config.nextAuth.url}${Routes.SUBSCRIPTION}?session_id={CHECKOUT_SESSION_ID}&canceled=true`,
        };

        // if user already has a stripe id, add it to the options, else stripe will generate an id
        if (userFromDb && userFromDb.customer) {
          sessionOptions.customer = userFromDb.customer as string;
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

    // get local subscription data for logged in user
    case "GET":
      const subs = await prisma.subscription.findMany({
        where: {
          userId: user.id,
          isDeleted: false,
        },
        include: {
          org: true,
        },
      });

      res.status(StatusCodes.OK).json(subs);
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
