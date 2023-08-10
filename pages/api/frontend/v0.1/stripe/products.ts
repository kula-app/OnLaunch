import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { Product } from "../../../../../models/product";
import { createRedisInstance } from "../../../../../redis/redis";
import { loadConfig } from "../../../../../config/loadConfig";

const PRODUCTS_REDIS_KEY = "products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      const config = loadConfig();
      const logger = new Logger(__filename);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-11-15",
      });

      const redis = createRedisInstance();

      // check whether products are cached via redis
      const cachedProducts = await redis.get(PRODUCTS_REDIS_KEY);

      // if products are cached, then return them, else retrieve them from stripe
      if (cachedProducts) {
        logger.log("Returning cached products");
        return res.send(cachedProducts);
      }

      logger.log("Retrieving products from stripe");
      // retrieve products from stripe
      const products = await stripe.products.list({
        active: true,
        expand: ["data.default_price"],
      });

      // map the data to Product data type
      const result = products.data.map((product): Product => {
        return {
          id: (product as Stripe.Product).id,
          name: (product as Stripe.Product).name,
          description: (product as Stripe.Product).description as string,
          priceId: (product.default_price as Stripe.Price).id,
          priceAmount: Number(
            (product.default_price as Stripe.Price).unit_amount
          ),
        };
      });

      // sort products by price
      const sortedResult = result.sort((a, b) => {
        return (a.priceAmount as number) - (b.priceAmount as number);
      });

      // cache data set to expire after 1 hour
      // after expiration, the data will be retrieved again from stripe
      const MAX_AGE = 60_000 * config.redisConfig.cacheMaxAge;
      const EXPIRY_MS = `PX`; // milliseconds

      logger.log("Saving stripe products to redis cache")
      // save products to redis cache
      await redis.set(
        PRODUCTS_REDIS_KEY,
        JSON.stringify(sortedResult),
        EXPIRY_MS,
        MAX_AGE
      );

      res.status(StatusCodes.OK).end(JSON.stringify(sortedResult));
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
