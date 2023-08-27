import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { Product } from "../../../../../models/product";
import { createRedisInstance } from "../../../../../redis/redis";
import { loadConfig } from "../../../../../config/loadConfig";

const PRODUCTS_REDIS_KEY = "products";
const logger = new Logger(__filename);

export async function getProducts() {
  const config = loadConfig();
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
      return cachedProducts;
    }
  } catch (error) {
    logger.error(`Redis error: ${error}`);
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
        (addonProduct) => addonProduct.metadata["mainProductId"] === product.id
      );

      let matchingProduct: Product | undefined;

      if (matchingAddonProduct) {
        const matchingPrice =
          matchingAddonProduct.default_price as Stripe.Price;

        matchingProduct = {
          id: matchingAddonProduct.id,
          name: matchingAddonProduct.name,
          description: matchingAddonProduct.description as string,
          priceId: matchingPrice.id,
          priceAmount: Number(matchingPrice.unit_amount),
          divideBy: Number(matchingPrice.transform_quantity?.divide_by),
        };
      }

      const prod = product as Stripe.Product;
      const price = product.default_price as Stripe.Price;

      return {
        id: prod.id,
        name: prod.name,
        description: prod.description as string,
        priceId: price.id,
        priceAmount: Number(price.unit_amount),
        requests: Number(prod.metadata["requests"]),
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

    return JSON.stringify(sortedResult);
  } catch (stripeError) {
    logger.error(`Error fetching products from Stripe: ${stripeError}`);
    throw new Error("Failed to fetch products from Stripe.");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      try {
        const result = await getProducts();
        res.status(StatusCodes.OK).end(result);
      } catch (error) {
        logger.error(`Error: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).end(error);
      }
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
