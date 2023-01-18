// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

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
  switch (req.method) {
    case "GET":
      const allMessages = await prisma.message.findMany({
        include: {
          actions: true,
        },
        where: {
          AND: [
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
                // @ts-ignore
                actionType: action.actionType,
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
