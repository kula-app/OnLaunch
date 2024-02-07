import { Action, Prisma } from "@prisma/client";
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

  const messageId = Number(req.query.messageId);

  switch (req.method) {
    // Retrieve message
    case "GET":
      logger.log(
        `Looking up message with id '${messageId}' for app with id(=${authResult.id})`
      );
      const message = await prisma.message.findUnique({
        include: {
          actions: true,
        },
        where: {
          id: messageId,
          appId: authResult.id,
        },
      });

      if (message == null) {
        logger.log(
          `No message found with id '${messageId}' for app with id(=${authResult.id})`
        );
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: `No message found with id ${messageId}` });
      }

      const convertedActions: ActionDto[] = message.actions.map(
        (action): ActionDto => ({
          title: action.title,
          actionType: action.actionType,
          buttonDesign: action.buttonDesign,
        })
      );
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

      return res.status(StatusCodes.OK).json(dto);

    // Delete message
    case "DELETE":
      try {
        logger.log(
          `Deleting message with id '${messageId}' for app with id(=${authResult.id})`
        );
        const deletedMessage = await prisma.message.delete({
          where: {
            id: messageId,
            appId: authResult.id,
          },
        });

        const dto: MessageDto = {
          id: deletedMessage.id,
          createdAt: deletedMessage.createdAt,
          updatedAt: deletedMessage.updatedAt,
          blocking: deletedMessage.blocking,
          title: deletedMessage.title,
          body: deletedMessage.body,
          startDate: deletedMessage.startDate,
          endDate: deletedMessage.endDate,
          actions: [],
        };

        return res.status(StatusCodes.OK).json(dto);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(
            `No message found with id '${messageId}' for app with id(=${authResult.id})`
          );
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "No message found with id " + messageId,
          });
        }

        logger.error(`Internal server error occurred: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message:
            "An internal server error occurred - please try again later!",
        });
      }

    // Updating message
    case "PUT":
      const updateMessageDto = plainToInstance(CreateMessageDto, req.body);
      const validationErrors = await validate(updateMessageDto);

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

      try {
        logger.log(
          `Updating message with id '${messageId}' for app with id(=${authResult.id})`
        );
        const updatedMessage = await prisma.message.update({
          where: {
            id: messageId,
            appId: authResult.id,
          },
          data: {
            blocking: updateMessageDto.blocking,
            title: updateMessageDto.title,
            body: updateMessageDto.body,
            startDate: new Date(updateMessageDto.startDate),
            endDate: new Date(updateMessageDto.endDate),
          },
        });

        logger.log(`Deleting actions of message with id '${messageId}'`);
        await prisma.action.deleteMany({
          where: {
            messageId: messageId,
          },
        });

        let convertedActions: ActionDto[] = [];
        if (updateMessageDto.actions && updateMessageDto.actions.length > 0) {
          const actions: Action[] = updateMessageDto.actions;

          actions.forEach((action) => {
            action.messageId = messageId;
          });

          logger.log(`Creating actions for message with id '${messageId}'`);
          await prisma.action.createMany({
            data: updateMessageDto.actions,
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
          id: updatedMessage.id,
          createdAt: updatedMessage.createdAt,
          updatedAt: updatedMessage.updatedAt,
          blocking: updatedMessage.blocking,
          title: updatedMessage.title,
          body: updatedMessage.body,
          startDate: updatedMessage.startDate,
          endDate: updatedMessage.endDate,
          actions: convertedActions,
        };

        return res.status(StatusCodes.CREATED).json(dto);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.log(`No message found with id '${messageId}'`);
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "No message found with id " + messageId,
          });
        }

        logger.error(`Internal server error occurred: ${e}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message:
            "An internal server error occurred - please try again later!",
        });
      }

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
