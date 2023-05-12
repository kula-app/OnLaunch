import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { Logger } from "../../../util/logger";

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
