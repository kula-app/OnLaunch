import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserWithRoleFromRequest } from "../../../../../../../../../util/auth";

const prisma: PrismaClient = new PrismaClient();

enum ActionType {
  Dismiss = "DISMISS",
}

type Action = {
  id: number;
  actionType: ActionType;
  title: string;
  messageId: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
    return;
  }
  
  switch (req.method) {
    case "GET":
      const message = await prisma.message.findUnique({
        include: {
          actions: true,
        },
        where: {
          id: Number(req.query.messageId),
        },
      });

      if (message == null) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "no message found with id " + req.query.messageId });
        return;
      }

      res.status(StatusCodes.OK).json(message);
      break;

    case "DELETE":
      try {
        await prisma.action.deleteMany({
          where: {
            messageId: Number(req.query.messageId),
          },
        });

        const deletedMessage = await prisma.message.delete({
          where: {
            id: Number(req.query.messageId),
          },
        });

        res.status(StatusCodes.OK).json(deletedMessage);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          res
            .status(StatusCodes.NOT_FOUND)
            .json({
              message: "no message found with id " + req.query.messageId,
            });
          return;
        }
      }
      break;

    case "PUT":
      try {
        if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "start date has to be before end date" });
          return;
        }

        const updatedMessage = await prisma.message.update({
          where: {
            id: Number(req.query.messageId),
          },
          data: {
            blocking: req.body.blocking,
            title: req.body.title,
            body: req.body.body,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            appId: req.body.appId,
          },
        });

        const deletedActions = await prisma.action.deleteMany({
          where: {
            messageId: Number(req.query.messageId),
          },
        });

        if (req.body.actions.length > 0) {
          const actions: Action[] = req.body.actions;
          actions.forEach((action) => {
            action.messageId = Number(req.query.messageId);
          });
          const savedActions = await prisma.action.createMany({
            data: req.body.actions,
          });
        }

        res.status(StatusCodes.CREATED).json(updatedMessage);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          res
            .status(StatusCodes.NOT_FOUND)
            .json({
              message: "no message found with id " + req.query.messageId,
            });
          return;
        }
      }
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
