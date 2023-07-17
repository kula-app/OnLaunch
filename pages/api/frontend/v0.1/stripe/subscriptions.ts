import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { loadConfig } from "../../../../../config/loadConfig";
import Routes from "../../../../../routes/routes";
import { log } from "console";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();

  switch (req.method) {
    case "POST":
      const logger = new Logger(__filename);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-11-15",
      });

      // TODO user has to be logged in

      // TODO check whether user has a stripe customer id with prisma

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
        const session = await stripe.checkout.sessions.create({
          billing_address_collection: "auto",
          line_items: [
            {
              price: req.body.priceId,
              // for metered billing, do not pass quantity
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${config.nextAuth.url}${Routes.SUBSCRIPTION_SUCCESS}`,
          cancel_url: `${config.nextAuth.url}${Routes.SUBSCRIPTION_CANCELED}`,
        });

        logger.log("request: " + req);
        logger.log("Request headers: " + JSON.stringify(req.headers));
        logger.log("Request body: " + JSON.stringify(req.body));
        logger.log("Request method: " + req.method);

        logger.log("Redirecting to Stripe checkout");
        res.redirect(StatusCodes.SEE_OTHER, session.url as string);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
      }
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
