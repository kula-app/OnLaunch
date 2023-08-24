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
      
      try {
        // check whether products are cached via redis
        const cachedProducts = await redis.get(PRODUCTS_REDIS_KEY);

        // if products are cached, then return them, else retrieve them from stripe
        if (cachedProducts) {
          logger.log("Returning cached products");
          return res.send(cachedProducts);
        }
      } catch (e) {
        logger.error(`Redis error: ${e}`);
      }

      try {
        logger.log("Retrieving products from stripe");
        // retrieve products from stripe
        const products = await stripe.products.list({
          active: true,
          expand: ["data.default_price"],
        });

        // check if the right metadata is set (to not mix with other
        // products from other services)
        const filteredProductsByMetadata = products.data.filter((product) => {
          product = product as Stripe.Product;
          if (product.metadata["service"] && product.metadata["isActive"]) {
            return (
              product.metadata["service"].toLowerCase() === "onlaunch" &&
              product.metadata["isActive"] === "true"
            );
          }
          return false;
        });

        // split stripe products into main products and add-on products
        // add-on products can be ordered with the main products
        // e.g. to have x requests included in the main product but
        // gain unlimited requests by paying for exceeding requests
        // via the add-on product
        const mainProducts = filteredProductsByMetadata.filter(
          (product) => !product.metadata["mainProductId"]
        );
        const addonProducts = filteredProductsByMetadata.filter(
          (product) => product.metadata["mainProductId"]
        );

        // map the data to Product data type
        const result = mainProducts.map((product): Product => {
          const matchingAddonProduct = addonProducts.find(
            (addonProduct) =>
              addonProduct.metadata["mainProductId"] === product.id
          );

          let matchingProduct: Product | undefined;

          if (matchingAddonProduct) {
            matchingProduct = {
              id: matchingAddonProduct.id,
              name: matchingAddonProduct.name,
              description: matchingAddonProduct.description as string,
              priceId: (matchingAddonProduct.default_price as Stripe.Price).id,
              priceAmount: Number(
                (matchingAddonProduct.default_price as Stripe.Price).unit_amount
              ),
              divideBy: Number(
                (matchingAddonProduct.default_price as Stripe.Price)
                  .transform_quantity?.divide_by
              ),
            };
          }

          return {
            id: (product as Stripe.Product).id,
            name: (product as Stripe.Product).name,
            description: (product as Stripe.Product).description as string,
            priceId: (product.default_price as Stripe.Price).id,
            priceAmount: Number(
              (product.default_price as Stripe.Price).unit_amount
            ),
            requests: Number((product as Stripe.Product).metadata["requests"]),
            unlimitedOption: matchingProduct,
          };
        });

        // sort products by price
        const sortedResult = result.sort((a, b) => {
          return (a.priceAmount as number) - (b.priceAmount as number);
        });

        try {
          // cache data set to expire after 1 hour
          // after expiration, the data will be retrieved again from stripe
          const MAX_AGE = 60_000 * config.redisConfig.cacheMaxAge;
          const EXPIRY_MS = `PX`; // milliseconds

          logger.log("Saving stripe products to redis cache");
          // save products to redis cache
          await redis.set(
            PRODUCTS_REDIS_KEY,
            JSON.stringify(sortedResult),
            EXPIRY_MS,
            MAX_AGE
          );
        } catch (redisError) {
          logger.error(`Failed to cache products in Redis: ${redisError}`);
        }

        res.status(StatusCodes.OK).end(JSON.stringify(sortedResult));
      } catch (stripeError) {
        logger.error(`Error fetching products from Stripe: ${stripeError}`);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .end("Failed to fetch products from Stripe.");
      }
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
