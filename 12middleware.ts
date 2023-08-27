import type { NextApiRequest, NextApiResponse } from "next";
import { getProducts } from "./pages/api/frontend/v0.1/stripe/products";
import { Logger } from "./util/logger";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";

const FREE_SUB_REQUEST_LIMIT = 10;

export async function middleware(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // regex pattern to match the message api for the app clients
  // accepting every version number (e.g. /api/v0.1/messages)
  const regexPattern = /\/api\/v\d+(\.\d+)?\/messages/;

  // Check whether the request path matches the pattern
  if (regexPattern.test(req.url || "")) {
    try {
      const products = JSON.parse(await getProducts());

      const publicKey = req.headers["x-api-key"];
      console.log("publicKey: " + publicKey);

      const prisma: PrismaClient = new PrismaClient();
      // get org and sub information to retrieve product limit
      const app = await prisma.app.findFirst({
        where: {
          publicKey: publicKey as string,
        },
        include: {
          organisation: {
            include: {
              subs: {
                where: {
                  isDeleted: false,
                },
                include: {
                  subItems: true,
                },
              },
            },
          },
        },
      });

      // Check if there is a subItem with isMetered set to true
      let hasMeteredSubItem = false;
      // there should be 0 or 1 sub
      let subFromDb = app?.organisation?.subs[0];

      if (app?.organisation?.subs) {
        for (const sub of app.organisation.subs) {
          const foundSubItem = sub.subItems?.find(
            (subItem) => subItem.metered === true
          );

          if (foundSubItem) {
            hasMeteredSubItem = true;
            break;
          }
        }
      }

      // if not metered, check for the limit
      if (!hasMeteredSubItem) {
        let countingStartDate = new Date();

        // free version counts back plainly 31 days
        if (!subFromDb) {
          countingStartDate.setDate(countingStartDate.getDate() - 31);
          console.log("free version - date: " + countingStartDate);
        } else {
          countingStartDate = subFromDb.currentPeriodStart;
          console.log("unmetered sub - date: " + countingStartDate);
        }

        // check whether quota/limit for the request has been met
        const requestCount = await prisma.loggedApiRequests.count({
          where: {
            publicKey: publicKey as string,
            createdAt: {
              gte: countingStartDate,
            },
          },
        });

        let isLimitReached = false;

        if (subFromDb) {
          const targetProduct = products.find(
            (product: { id: string | undefined }) =>
              product.id === subFromDb?.subItems[0].productId
          );

          if (requestCount >= Number(targetProduct.metadata["requests"])) {
            isLimitReached = true;
          }
        } else if (!subFromDb && requestCount >= FREE_SUB_REQUEST_LIMIT) {
          // check for free version
          isLimitReached = true;
        }

        if (isLimitReached) {
          res
            .status(StatusCodes.TOO_MANY_REQUESTS)
            .json({ error: "The limit has been reached." });
          return;
        }
      }
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
  } else {
    console.log("else else else ")
  }
}
