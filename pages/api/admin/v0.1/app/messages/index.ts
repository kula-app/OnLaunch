import { Action } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { CreateMessageDto } from "../../../../../../models/dtos/request/createMessageDto";
import { ActionDto } from "../../../../../../models/dtos/response/actionDto";
import { MessageDto } from "../../../../../../models/dtos/response/messageDto";
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
      logger.log(`Getting messages for app with id(=${authResult.id})`);
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
      const createMessageDto = plainToInstance(CreateMessageDto, req.body);
      const validationErrors = await validate(createMessageDto);

      if (validationErrors.length > 0) {
        const errors = validationErrors
          .flatMap((error) =>
            error.constraints
              ? Object.values(error.constraints)
              : ["An unknown error occurred"]
          )
          .join(", ");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `Validation failed: ${errors}` });
      }

      logger.log(`Creating message for app id '${authResult.id}'`);
      const message = await prisma.message.create({
        data: {
          blocking: createMessageDto.blocking,
          title: createMessageDto.title,
          body: createMessageDto.body,
          startDate: new Date(createMessageDto.startDate),
          endDate: new Date(createMessageDto.endDate),
          appId: authResult.id,
        },
      });

      let convertedActions: ActionDto[] = [];
      if (createMessageDto.actions && createMessageDto.actions.length > 0) {
        logger.log(`Creating actions for message with id '${message.id}'`);
        const actions: Action[] = createMessageDto.actions;

        actions.forEach((action) => {
          action.messageId = message.id;
        });

        await prisma.action.createMany({
          data: createMessageDto.actions,
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
