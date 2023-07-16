import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { Product } from "../../../../../models/product";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      const logger = new Logger(__filename);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-11-15",
      });

      logger.log("Retrieving products from stripe");
      const products = await stripe.products.list({ active: true });
      logger.log("Retrieving prices from stripe");
      const prices = await stripe.prices.list({ active: true });

      // map the products with their respective prices
      const result = products.data.map((product): Product => {
        const productPrice = prices.data.find(
          (price) => price.product === product.id
        );
        let priceAmount = productPrice ? productPrice.unit_amount : null;
        let priceId = productPrice ? productPrice.id : null;

        return {
          id: product.id,
          name: product.name,
          description: product.description as string,
          priceId: priceId,
          price: priceAmount,
        };
      });

      // sort by products by price
      const sortedResult = result.sort((a, b) => {
          return (a.price as number) - (b.price as number);
      });
      
      res.status(200).end(JSON.stringify(sortedResult));
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
