import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../../util/logger";
import requestIp from "request-ip";
import { getProducts } from "../frontend/v0.1/stripe/products";

const prisma: PrismaClient = new PrismaClient();

enum ActionType {
  Dismiss = "DISMISS",
}

type ActionDto = {
  actionType: ActionType;
  title: string;
};

type ResponseDto = {
  id: number;
  blocking: boolean;
  title: string;
  body: string;
  actions: ActionDto[];
};

/**
 * @swagger
 * /api/v0.1/messages:
 *   get:
 *     summary: Get messages for an app.
 *     description: Retrieves all messages for an app based on the provided API key.
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         description: The API key for the app.
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful response. Returns an array of messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   blocking:
 *                     type: boolean
 *                   title:
 *                     type: string
 *                   body:
 *                     type: string
 *                   actions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         actionType:
 *                           type: string
 *                           enum:
 *                             - DISMISS
 *                         title:
 *                           type: string
 *       400:
 *         description: Bad request. No API key provided.
 *       404:
 *         description: App not found. No app found for the provided API key.
 *       405:
 *         description: Method not allowed. Only GET requests are supported.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);
  const FREE_SUB_REQUEST_LIMIT = 10;

  switch (req.method) {
    case "GET":
      const publicKey = req.headers["x-api-key"];

      if (!publicKey) {
        logger.error("No api key provided");
        res.status(StatusCodes.BAD_REQUEST).end("no api key provided");
        return;
      }

      // Get app, org, (appIds) and sub information to retrieve product limit
      logger.log(`Looking up api key '${publicKey as string}'`);
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
              apps: true,
            },
          },
        },
      });

      if (!app) {
        logger.log(`No app found for api key '${publicKey as string}'`);
        res.status(StatusCodes.NOT_FOUND).end("no app found for api key");
        return;
      }

      // Start of quota limitation
      try {
        const products = JSON.parse(await getProducts());

        // Check if there is a subItem with isMetered set to true
        // Metered subItems do not have a limit
        let hasMeteredSubItem = false;
        // There should be 0 or 1 sub
        let subFromDb = app?.organisation?.subs[0];

        if (app?.organisation?.subs) {
          for (const sub of app.organisation.subs) {
            if (sub.subItems?.some((subItem) => subItem.metered === true)) {
              hasMeteredSubItem = true;
              break;
            }
          }
        }

        // If not metered, check for the limit
        if (!hasMeteredSubItem) {
          let countingStartDate = new Date();

          // Free version counts back plainly one month
          if (!subFromDb) {
            countingStartDate.setMonth(countingStartDate.getMonth() - 1);
            console.log("free version - date: " + countingStartDate);
          } else {
            // use current period start of active subscription
            countingStartDate = subFromDb.currentPeriodStart;
            console.log("unmetered sub - date: " + countingStartDate);
          }

          // Prepare array of app ids of organisation
          const appIds = app?.organisation?.apps?.map((app) => app.id) || [];

          // Count requests across all apps of the org
          const requestCount = await prisma.loggedApiRequests.count({
            where: {
              appId: {
                in: appIds,
              },
              createdAt: {
                gte: countingStartDate,
              },
            },
          });
          logger.log(`Request count for org with id '${app.orgId}' is ${requestCount}`);

          let isLimitReached = false;

          // Check whether quota/limit for the request has been met (active subscription)
          if (subFromDb) {
            const targetProduct = products.find(
              (product: { id: string | undefined }) =>
                product.id === subFromDb?.subItems[0].productId
            );

            logger.log(`Request limit for org with id '${app.orgId}' is ${targetProduct.requests}`);
            if (requestCount >= Number(targetProduct.requests)) {
              isLimitReached = true;
            }
          } else if (!subFromDb && requestCount >= FREE_SUB_REQUEST_LIMIT) {
            // Check quota/limit for free version
            isLimitReached = true;
          }

          // Return error if limit has been reached and the request cannot be served
          if (isLimitReached) {
            logger.log(
              `The limit has been currently reached for org with id '${app?.orgId}'`
            );
            res
              .status(StatusCodes.TOO_MANY_REQUESTS)
              .end("The limit has been reached.");
              return;
          }
        }
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).end({ error });
        return;
      }

      logger.log(`Looking up all messages for app with id '${app.id}'`);
      const allMessages = await prisma.message.findMany({
        include: {
          actions: true,
        },
        where: {
          AND: [
            {
              appId: app.id,
            },
            {
              startDate: {
                lte: new Date(),
              },
            },
            {
              endDate: {
                gte: new Date(),
              },
            },
          ],
        },
      });

      const ip = requestIp.getClientIp(req);

      logger.log(
        `Creating logged API request for ip '${ip}' and app with id ${app.id} and public key ${publicKey}`
      );
      await prisma.loggedApiRequests.create({
        data: {
          ip: ip as string,
          appId: app.id,
          publicKey: publicKey as string,
        },
      });

      res.status(StatusCodes.OK).json(
        allMessages.map((message): ResponseDto => {
          return {
            id: message.id,
            blocking: message.blocking,
            title: message.title,
            body: message.body,
            actions: message.actions.map((action): ActionDto => {
              return {
                actionType: action.actionType as ActionType,
                title: action.title,
              };
            }),
          };
        })
      );
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
