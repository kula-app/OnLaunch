import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { authenticate } from "../../../../../util/adminApi/auth";
import { decodeToken } from "../../../../../util/adminApi/tokenDecoding";
import { generateToken } from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const authToken = await authenticate(
    req,
    res,
    // For getting/updating an app, the token has to be an
    // AppAdminToken, for creating/posting a new app, the
    // token has to be an OrganisationAdminToken
    req.method === "POST" ? "org" : "app"
  );

  // When no authToken has been returned, then the NextApiResponse
  // has already ended with an error
  if (!authToken) return;

  const tokenInfo = decodeToken(authToken);

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
          orgId: tokenInfo?.id,
          publicKey: generatedToken,
        },
      });

      return res.status(StatusCodes.CREATED).json(newApp);

    // Find app by token
    // If found, return app data with message
    case "GET":
      logger.log(`Looking up app with id(='${tokenInfo?.id}'`);

      const app = await prisma.app.findUnique({
        where: {
          id: tokenInfo?.id,
        },
        include: {
          messages: true,
        },
      });

      if (app == null) {
        logger.error(`No app found with id '${tokenInfo?.id}'`);
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No app found with id '${tokenInfo?.id}'`,
        });
      }

      return res.status(StatusCodes.OK).json({
        id: app.id,
        name: app.name,
        publicKey: app.publicKey,
        messages: app.messages,
      });

    // Update app
    case "PUT":
      try {
        logger.log(`Updating app with id(='${tokenInfo?.id}'`);

        const updatedApp = await prisma.app.update({
          where: {
            id: tokenInfo?.id,
          },
          data: {
            name: req.body.name,
          },
        });

        return res.status(StatusCodes.CREATED).json(updatedApp);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(`No app found with id '${tokenInfo?.id}'`);
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "No app found with id " + tokenInfo?.id });
        }
      }
      break;

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
