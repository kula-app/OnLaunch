import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      const logger = new Logger(__filename);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-11-15",
      });

      // TODO check whether user has a stripe customer id with prisma

      logger.log("Retrieving products from stripe");
      //const products = await stripe.subscriptions.create()
      // TODO create stripe checkout session

      
      res.status(200).end(JSON.stringify(null));
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
