import { $Enums } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import {
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  validateOrReject,
  ValidationError,
} from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";
import { loadServerConfig } from "../../../config/loadServerConfig";
import prisma from "../../../lib/services/db";
import { Logger } from "../../../util/logger";
import { getProducts } from "../frontend/v0.1/stripe/products";

class MessagesRequestHeadersDto {
  @IsString()
  @IsDefined()
  "x-api-key"!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-bundle-id"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-bundle-version"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-locale"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-locale-language-code"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-locale-region-code"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-platform-name"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-platform-version"?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  "x-onlaunch-release-version"?: string;
}

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

interface ErrorObjectDto {
  message: string;
}

const logger = new Logger(__filename);

/**
 * @swagger
 * tags:
 *   - name: Client API
 *     description: Operations related to the retrieval of messages for the (mobile) clients
 *
 * /api/v0.1/messages:
 *   get:
 *     tags:
 *       - Client API
 *     summary: Get messages for an app.
 *     description: Retrieves all messages for an app based on the provided API key.
 *     parameters:
 *       - name: x-api-key
 *         in: header
 *         description: The API key for the app.
 *         required: true
 *         type: string
 *     deprecated: true
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
  res: NextApiResponse<ResponseDto[] | ErrorObjectDto>
) {
  switch (req.method) {
    case "GET":
      return getHandler(req, res);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const headers = plainToInstance(MessagesRequestHeadersDto, req.headers);
  try {
    await validateOrReject(headers, {
      stopAtFirstError: true,
    });
  } catch (error: any) {
    logger.verbose(`Validation Error: ${JSON.stringify(error)}`);

    if (error instanceof Array && error[0] instanceof ValidationError) {
      const validationError = error[0] as ValidationError;
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation Error",
        constraints: validationError.constraints,
      });
    }

    throw error;
  }
  const config = loadServerConfig();
  const FREE_SUB_REQUEST_LIMIT = config.freeSub.requestLimit;

  const publicKey = req.headers["x-api-key"] as string;

  if (!publicKey) {
    logger.error("No api key provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "no api key provided" });
  }

  // Get app, org, (appIds) and sub information to retrieve product limit
  logger.log(`Looking up api key '${publicKey as string}'`);
  const app = await prisma.app.findFirst({
    where: {
      publicKey: publicKey,
      organisation: {
        isDeleted: false,
      },
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
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no app found for api key" });
  }

  // Start of quota limitation
  if (config.stripeConfig.isEnabled) {
    try {
      const products = await getProducts();

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
        } else {
          // use current period start of active subscription
          countingStartDate = subFromDb.currentPeriodStart;
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
        logger.log(
          `Request count for org with id '${app.orgId}' is ${requestCount}`
        );

        let isLimitReached = false;

        // Check whether quota/limit for the request has been met (active subscription)
        if (subFromDb) {
          const targetProduct = products.find(
            (product: { id: string | undefined }) =>
              product.id === subFromDb?.subItems[0].productId
          );

          if (!targetProduct) {
            logger.error(
              `No product found for org with id '${app.orgId}' and active sub with id '${subFromDb.subId}'`
            );
            return res
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .json({ message: "Please try again later" });
          }

          logger.log(
            `Request limit for org with id '${app.orgId}' is ${targetProduct.requests}`
          );
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
          return res.status(StatusCodes.PAYMENT_REQUIRED).json({
            message: "The limit for the current abo has been reached.",
          });
        }
      }
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
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
    orderBy: {
      startDate: "asc",
    },
  });

  const ip = requestIp.getClientIp(req);

  // logging the api requests after checking if the app exists, so it is only logged when the request could successfully be served so far
  // as logged requests are used for tracking, only for successful requests should be tracked
  logger.log(
    `Creating logged API request for ip '${ip}' and app with id ${app.id} and public key ${publicKey}`
  );
  await prisma.loggedApiRequests.create({
    data: {
      ip: ip as string,
      appId: app.id,
      publicKey: publicKey,

      clientBundleId: headers["x-onlaunch-bundle-id"],
      clientBundleVersion: headers["x-onlaunch-bundle-version"],
      clientLocale: headers["x-onlaunch-locale"],
      clientLocaleLanguageCode: headers["x-onlaunch-locale-language-code"],
      clientLocaleRegionCode: headers["x-onlaunch-locale-region-code"],
      clientPlatformName: headers["x-onlaunch-platform-name"],
      clientPlatformVersion: headers["x-onlaunch-platform-version"],
      clientReleaseVersion: headers["x-onlaunch-release-version"],
    },
  });

  return res.status(StatusCodes.OK).json(
    allMessages.map((message): ResponseDto => {
      return {
        id: message.id,
        blocking: message.blocking,
        title: message.title,
        body: message.body,
        actions: message.actions.reduce((prev, action): ActionDto[] => {
          let actionType: ActionType;
          switch (action.actionType) {
            case $Enums.ActionType.DISMISS:
              actionType = ActionType.Dismiss;
              break;
            default:
              return prev;
          }
          return prev.concat([
            {
              actionType: action.actionType as ActionType,
              title: action.title,
            },
          ]);
        }, new Array<ActionDto>()),
      };
    })
  );
}
