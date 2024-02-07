import { Prisma } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { CreateAppDto } from "../../../../../models/dtos/request/createAppDto";
import { AppDto } from "../../../../../models/dtos/response/appDto";
import { MessageDto } from "../../../../../models/dtos/response/messageDto";
import { authenticate } from "../../../../../util/adminApi/auth";
import { Logger } from "../../../../../util/logger";

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
    // Find app by token
    // If found, return app data with message
    case "GET":
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
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No app found with id '${authResult.id}'`,
        });
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

    // Update app
    case "PUT":
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
          .json({ message: `Validation failed: ${errors}` });
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
            .json({ message: "No app found with id " + authResult.id });
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
