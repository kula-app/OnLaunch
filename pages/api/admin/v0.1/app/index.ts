import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { AuthResult } from "../../../../../models/authResult";
import { CreateAppDto } from "../../../../../models/dtos/request/createAppDto";
import { AppDto } from "../../../../../models/dtos/response/appDto";
import { MessageDto } from "../../../../../models/dtos/response/messageDto";
import { authenticate } from "../../../../../util/adminApi/auth";
import { Logger } from "../../../../../util/logger";

const logger = new Logger(__filename);

/**
 * @swagger
 * tags:
 *   - name: Admin API
 *     description: Operations related to the management in the Admin API
 *
 * /api/admin/v0.1/app:
 *   get:
 *     tags:
 *       - Admin API
 *     summary: Get app data by token
 *     description: Retrieves the app data along with its messages for the authenticated app based on the provided token.
 *     responses:
 *       200:
 *         description: App data found and returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppDto'
 *       401:
 *         description: Authentication failed, invalid or missing credentials.
 *       404:
 *         description: No app found with the provided ID.
 *
 *   put:
 *     tags:
 *       - Admin API
 *     summary: Update app data
 *     description: Updates the app data for the authenticated app based on the provided token and request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppDto'
 *     responses:
 *       201:
 *         description: App data updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppDto'
 *       400:
 *         description: Validation failed for the provided app data.
 *       401:
 *         description: Authentication failed, invalid or missing credentials.
 *       404:
 *         description: No app found to update with the provided ID.
 *       500:
 *         description: An internal server error occurred.
 *
 * components:
 *   schemas:
 *     AppDto:
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
 *         name:
 *           type: string
 *         publicKey:
 *           type: string
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MessageDto'
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
 *     CreateAppDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppDto | ErrorDto>
) {
  const authResult = await authenticate(req, "app");

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json(getErrorDto(authResult.errorMessage));

  switch (req.method) {
    // Find app by token
    // If found, return app data with message
    case "GET":
      return getHandler(req, res, authResult);
    // Update app
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
  logger.log(`Looking up app with id(='${authResult.id})'`);

  const app = await prisma.app.findUnique({
    where: {
      id: authResult.id,
    },
    include: {
      messages: true,
    },
  });

  if (app == null) {
    logger.error(`No app found with id '${authResult.id}'`);
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(getErrorDto(`No app found with id '${authResult.id}'`));
  }

  const convertedMessages: MessageDto[] = app.messages.map(
    (message): MessageDto => ({
      id: message.id,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      blocking: message.blocking,
      title: message.title,
      body: message.body,
      endDate: message.endDate,
      startDate: message.startDate,
    })
  );
  const foundAppDto: AppDto = {
    id: app.id,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    name: app.name,
    publicKey: app.publicKey,
    messages: convertedMessages,
  };

  return res.status(StatusCodes.OK).json(foundAppDto);
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult
) {
  const updateAppDto = plainToInstance(CreateAppDto, req.body);
  const validationErrors = await validate(updateAppDto);

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
    logger.log(`Updating app with id(='${authResult.id})'`);

    const updatedApp = await prisma.app.update({
      where: {
        id: authResult.id,
      },
      data: {
        name: updateAppDto.name,
      },
    });

    const dto: AppDto = {
      id: updatedApp.id,
      createdAt: updatedApp.createdAt,
      updatedAt: updatedApp.updatedAt,
      name: updatedApp.name,
      publicKey: updatedApp.publicKey,
    };

    return res.status(StatusCodes.CREATED).json(dto);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`No app found with id '${authResult.id}'`);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(getErrorDto("No app found with id " + authResult.id));
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
