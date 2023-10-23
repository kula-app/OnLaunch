import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../../../lib/services/db";
import { getUserWithRoleFromRequest } from "../../../../../../../../../util/auth";
import { Logger } from "../../../../../../../../../util/logger";

enum ActionType {
  Dismiss = "DISMISS",
}

enum ButtonDesign {
  Text = "TEXT",
  Filled = "FILLED",
}

type Action = {
  id: number;
  actionType: ActionType;
  buttonDesign: ButtonDesign;
  title: string;
  messageId: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
      logger.log(`Looking up message with app id '${req.query.appId}'`);
      const allMessages = await prisma.message.findMany({
        include: {
          actions: true,
        },
        where: {
          appId: Number(req.query.appId),
        },
      });

      return res.status(StatusCodes.OK).json(allMessages);

    case "POST":
      if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
        logger.log("Start date has to be before end date");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Start date has to be before end date" });
      }

      logger.log(`Creating message for app id '${req.query.appId}'`);
      const message = await prisma.message.create({
        data: {
          blocking: req.body.blocking,
          title: req.body.title,
          body: req.body.body,
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          appId: req.body.appId,
        },
      });

      if (req.body.actions.length > 0) {
        logger.log(`Creating actions for message with id '${message.id}'`);
        const actions: Action[] = req.body.actions;
        actions.forEach((action) => {
          action.messageId = message.id;
        });
        await prisma.action.createMany({
          data: req.body.actions,
        });
      }

      return res.status(StatusCodes.CREATED).json(message);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
