import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { AppDto } from "../../../../../../models/dtos/appDto";
import { MessageDto } from "../../../../../../models/dtos/messageDto";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { generateToken } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const authResult = await authenticate(
    req,
    // For getting/updating an app, the token has to be an
    // AppAdminToken, for creating/posting a new app, the
    // token has to be an OrganisationAdminToken
    req.method === "POST" ? "org" : "app"
  );

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json({ message: authResult.errorMessage });

  switch (req.method) {
    // Create new app
    case "POST":
      const name = req.body.name;

      if (!name) {
        logger.error("No name parameter provided for new app!");
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "No name parameter provided for new app!",
        });
      }

      logger.log(`Creating app with name(='${name}'`);

      const generatedToken = generateToken();

      const newApp = await prisma.app.create({
        data: {
          name: name,
          orgId: authResult.id,
          publicKey: generatedToken,
        },
      });

      const dto: AppDto = {
        id: newApp.id,
        createdAt: newApp.createdAt,
        updatedAt: newApp.updatedAt,
        name: newApp.name,
        publicKey: newApp.publicKey,
      };

      return res.status(StatusCodes.CREATED).json(dto);

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
      try {
        logger.log(`Updating app with id(='${authResult.id})'`);

        const updatedApp = await prisma.app.update({
          where: {
            id: authResult.id,
          },
          data: {
            name: req.body.name,
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
