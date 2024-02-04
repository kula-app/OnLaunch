import { Action } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../lib/services/db";
import { ActionDto } from "../../../../../../../models/dtos/actionDto";
import { MessageDto } from "../../../../../../../models/dtos/messageDto";
import { authenticate } from "../../../../../../../util/adminApi/auth";
import { Logger } from "../../../../../../../util/logger";

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
    // Create new message
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
