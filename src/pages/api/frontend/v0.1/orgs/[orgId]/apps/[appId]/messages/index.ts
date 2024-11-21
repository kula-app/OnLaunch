import { Action } from "@/models/action";
import { User } from "@/models/user";
import prisma from "@/services/db";
import { authenticatedHandler } from "@/util/authenticatedHandler";
import { Logger } from "@/util/logger";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  return authenticatedHandler(
    req,
    res,
    { method: "withRole" },
    async (req, res, user) => {
      switch (req.method) {
        case "GET":
          return getHandler(req, res, user);

        case "POST":
          return postHandler(req, res, user);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "Method not allowed" });
      }
    },
  );
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  logger.log(`Looking up messages with app id '${req.query.appId}'`);
  const allMessages = await prisma.message.findMany({
    include: {
      actions: true,
    },
    where: {
      appId: Number(req.query.appId),
    },
    orderBy: {
      startDate: "asc",
      endDate: "asc",
    },
  });

  return res.status(StatusCodes.OK).json(allMessages);
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
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
    await prisma.messageAction.createMany({
      data: req.body.actions,
    });
  }

  return res.status(StatusCodes.CREATED).json(message);
}
