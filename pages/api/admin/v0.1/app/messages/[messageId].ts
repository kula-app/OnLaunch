import { Action, Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { AuthResult } from "../../../../../../models/authResult";
import { CreateMessageDto } from "../../../../../../models/dtos/request/createMessageDto";
import { ActionDto } from "../../../../../../models/dtos/response/actionDto";
import { MessageDto } from "../../../../../../models/dtos/response/messageDto";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { Logger } from "../../../../../../util/logger";

const logger = new Logger(__filename);

/**
 * @swagger
 * tags:
 *   - name: Admin API
 *     description: Operations related to the management in the Admin API
 *
 * /api/admin/v0.1/app/message/{messageId}:
 *   get:
 *     tags:
 *       - Admin API
 *     summary: Retrieve a message by ID
 *     description: Retrieves a message along with its actions for a given message ID.
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The message ID
 *     responses:
 *       200:
 *         description: A message object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageDto'
 *       404:
 *         description: No message found with the provided ID
 *
 *   delete:
 *     tags:
 *       - Admin API
 *     summary: Delete a message by ID
 *     description: Deletes a message for a given message ID.
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The message ID to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageDto'
 *       404:
 *         description: No message found with the provided ID
 *
 *   put:
 *     tags:
 *       - Admin API
 *     summary: Update a message
 *     description: Updates an existing message with new information.
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The message ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageDto'
 *     responses:
 *       201:
 *         description: Successfully updated the message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageDto'
 *       404:
 *         description: No message found with the provided ID
 *
 * components:
 *   schemas:
 *     MessageDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         blocking:
 *           type: boolean
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         actions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ActionDto'
 *     ActionDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         actionType:
 *           type: string
 *           enum: [DISMISS]
 *         buttonDesign:
 *           type: string
 *           enum: [FILLED, TEXT]
 *
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageDto | ErrorDto>
) {
  const authResult = await authenticate(req, "app");

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json(getErrorDto(authResult.errorMessage));

  switch (req.method) {
    // Retrieve message
    case "GET":
      return getHandler(req, res, authResult);
    // Delete message
    case "DELETE":
      return deleteHandler(req, res, authResult);
    // Updating message
    case "PUT":
      return putHandler(req, res, authResult);
    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json(getErrorDto("method not allowed"));
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult
) {
  const messageId = Number(req.query.messageId);

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
      .json(getErrorDto(`No message found with id ${messageId}`));
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
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult
) {
  const messageId = Number(req.query.messageId);

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
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(getErrorDto("No message found with id " + messageId));
    }

    logger.error(`Internal server error occurred: ${e}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        getErrorDto(
          "An internal server error occurred - please try again later!"
        )
      );
  }
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult
) {
  const messageId = Number(req.query.messageId);

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
      .json(getErrorDto(`Validation failed: ${errors}`));
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
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(getErrorDto("No message found with id " + messageId));
    }

    logger.error(`Internal server error occurred: ${e}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        getErrorDto(
          "An internal server error occurred - please try again later!"
        )
      );
  }
}
