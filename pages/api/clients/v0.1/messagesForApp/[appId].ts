// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

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
  // TODO: is this the cleanest solution for parameter validation available for Next.JS?
  if (req.query.appId == null) {
    res.status(405).end("parameter AppId needed");
  }
  
  switch (req.method) {
    case "GET":
      const publicKey = req.headers.publickey;
      
      if (!publicKey) {
        res.status(400).end("no publicKey provided");
        return;
      }
      
      const app = await prisma.app.findFirst({
        where: {
          publicKey: publicKey as string
        }
      });

      if (!app) {
        res.status(400).end("wrong publicKey provided");
        return;
      }

      const allMessages = await prisma.message.findMany({
        include: {
          actions: true,
        },
        where: {
          AND: [
            {
              appId: Number(req.query.appId)
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

      res.status(200).json(
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
      res.status(405).end("method not allowed");
      break;
  }
}
