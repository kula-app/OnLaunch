import { Action } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { ActionDto } from "../../../../../../models/dtos/actionDto";
import { MessageDto } from "../../../../../../models/dtos/messageDto";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const authResult = await authenticate(req, "app");

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json({ message: authResult.errorMessage });

  switch (req.method) {
    // Get all messages for app
    case "GET":
      logger.log(`Creating message for app id '${authResult.id}'`);
      const messages = await prisma.message.findMany({
        where: {
          appId: authResult.id,
        },
        include: {
          actions: true,
        },
      });

      const messageDtos: MessageDto[] = messages.map((message) => ({
        id: message.id,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        blocking: message.blocking,
        title: message.title,
        body: message.body,
        endDate: message.endDate,
        startDate: message.startDate,
        actions: message.actions.map((action) => ({
          id: action.id,
          title: action.title,
          actionType: action.actionType,
          buttonDesign: action.buttonDesign,
        })),
      }));

      return res.status(StatusCodes.CREATED).json(messageDtos);

    // Create new message
    case "POST":
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);

      if (startDate >= endDate) {
        logger.log("Start date has to be before end date");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Start date has to be before end date" });
      }

      const { blocking, body, title } = req.body;

      if (!blocking) {
        logger.log("Blocking parameter not provided");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Blocking parameter not provided" });
      }
      if (!body) {
        logger.log("Body parameter not provided");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Body parameter not provided" });
      }
      if (!title) {
        logger.log("Title parameter not provided");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Title parameter not provided" });
      }

      logger.log(`Creating message for app id '${authResult.id}'`);
      const message = await prisma.message.create({
        data: {
          blocking: blocking,
          title: title,
          body: body,
          startDate: startDate,
          endDate: endDate,
          appId: authResult.id,
        },
      });

      let convertedActions: ActionDto[] = [];
      if (req.body.actions.length > 0) {
        logger.log(`Creating actions for message with id '${message.id}'`);
        const actions: Action[] = req.body.actions;

        actions.forEach((action) => {
          action.messageId = message.id;
        });

        await prisma.action.createMany({
          data: req.body.actions,
        });

        convertedActions = actions.map(
          (action): ActionDto => ({
            title: action.title,
            actionType: action.actionType,
            buttonDesign: action.buttonDesign,
          })
        );
      }

      const dto: MessageDto = {
        id: message.id,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        blocking: message.blocking,
        title: message.title,
        body: message.body,
        startDate: message.startDate,
        endDate: message.endDate,
        actions: convertedActions,
      };

      return res.status(StatusCodes.CREATED).json(dto);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
