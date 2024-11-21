import { AuthResult } from "@/models/authResult";
import { ErrorDto, getErrorDto } from "@/models/dtos/error";
import { CreateMessageDto } from "@/models/dtos/request/createMessageDto";
import { ActionDto } from "@/models/dtos/response/actionDto";
import { MessageDto } from "@/models/dtos/response/messageDto";
import prisma from "@/services/db";
import { authenticate } from "@/util/adminApi/auth";
import { Logger } from "@/util/logger";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";

const logger = new Logger(__filename);

/**
 * @swagger
 * tags:
 *   - name: Admin API
 *     description: Operations related to the management in the Admin API
 *
 * /api/admin/v0.1/app/messages:
 *   get:
 *     tags:
 *       - Admin API
 *     summary: Get all messages for an app
 *     description: Retrieves all messages associated with an app, identified by the app's authentication credentials.
 *     responses:
 *       200:
 *         description: An array of message objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MessageDto'
 *       401:
 *         description: Authentication failed, invalid or missing credentials
 *
 *   post:
 *     tags:
 *       - Admin API
 *     summary: Create a new message
 *     description: Creates a new message for an app, with details provided in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageDto'
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageDto'
 *       400:
 *         description: Validation failed for the provided message data
 *       401:
 *         description: Authentication failed, invalid or missing credentials
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
 *         buttonDesign:
 *           type: string
 *     CreateMessageDto:
 *       type: object
 *       required:
 *         - blocking
 *         - title
 *         - body
 *         - startDate
 *         - endDate
 *       properties:
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
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageDto | MessageDto[] | ErrorDto>,
) {
  const authResult = await authenticate(req, "app");

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json(getErrorDto(authResult.errorMessage));

  switch (req.method) {
    // Get all messages for app
    case "GET":
      return getHandler(req, res, authResult);
    // Create new message
    case "POST":
      return postHandler(req, res, authResult);
    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json(getErrorDto("method not allowed"));
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult,
) {
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
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult,
) {
  const createMessageDto = plainToInstance(CreateMessageDto, req.body);
  const validationErrors = await validate(createMessageDto);

  if (validationErrors.length > 0) {
    const errors = validationErrors
      .flatMap((error) =>
        error.constraints
          ? Object.values(error.constraints)
          : ["An unknown error occurred"],
      )
      .join(", ");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(getErrorDto(`Validation failed: ${errors}`));
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
    const actions = createMessageDto.actions;

    actions.forEach((action) => {
      action.messageId = message.id;
    });

    await prisma.messageAction.createMany({
      data: createMessageDto.actions,
    });

    convertedActions = actions.map(
      (action): ActionDto => ({
        title: action.title,
        actionType: action.actionType,
        buttonDesign: action.buttonDesign,
      }),
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
}
