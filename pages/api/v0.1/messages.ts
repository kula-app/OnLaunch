import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../../util/logger";
import requestIp from 'request-ip';

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
  res: NextApiResponse<ResponseDto[]>
) {
  const logger = new Logger(__filename);

  switch (req.method) {
    case "GET":
      const publicKey = req.headers["x-api-key"];

      if (!publicKey) {
        logger.error("No api key provided");
        res.status(StatusCodes.BAD_REQUEST).end("no api key provided");
        return;
      }

      logger.log(`Looking up api key '${publicKey as string}'`);
      const app = await prisma.app.findFirst({
        where: {
          publicKey: publicKey as string,
        },
      });

      if (!app) {
        logger.log(`No app found for api key '${publicKey as string}'`);
        res.status(StatusCodes.NOT_FOUND).end("no app found for api key");
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
      
      const ip = requestIp.getClientIp(req)

      // logging the api requests now, so it is only logged when the request could successfully be served so far
      // as we use the logged requests for our abo models, our customers should not pay for unsuccessful requests
      logger.log(`Creating logged API request for ip '${ip}' and app with id ${app.id} and public key ${publicKey}`)
      await prisma.loggedApiRequests.create({
        data: {
          ip: ip as string,
          appId: app.id,
        }
      })

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
