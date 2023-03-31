import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

enum ActionType {
  Button = "BUTTON",
  DismissButton = "DISMISS_BUTTON",
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
  if (!req.query.appId) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).end("parameter AppId needed");
  }

  switch (req.method) {
    case "GET":
      const publicKey = req.headers.publickey;

      if (!publicKey) {
        res.status(StatusCodes.BAD_REQUEST).end("no publicKey provided");
        return;
      }

      const app = await prisma.app.findFirst({
        where: {
          publicKey: publicKey as string,
        },
      });

      if (!app) {
        res.status(StatusCodes.BAD_REQUEST).end("wrong publicKey provided");
        return;
      }

      const allMessages = await prisma.message.findMany({
        include: {
          actions: true,
        },
        where: {
          AND: [
            {
              appId: Number(req.query.appId),
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
