import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../../../lib/services/db";
import { User } from "../../../../../../../../models/user";
import { authenticatedHandler } from "../../../../../../../../util/authenticatedHandler";
import { Logger } from "../../../../../../../../util/logger";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  return authenticatedHandler(
    req,
    res,
    { method: "withRole" },
    async (req, res, user) => {
      const org = await prisma.organisation.findFirst({
        where: {
          id: Number(req.query.orgId),
          isDeleted: false,
        },
      });

      if (!org) {
        logger.error(
          `Organisation with id '${req.query.orgId}' has been deleted or not found`,
        );
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `Organisation with id '${req.query.orgId}' not found`,
        });
      }

      switch (req.method) {
        case "GET":
          return getHandler(req, res, user);

        case "DELETE":
          return deleteHandler(req, res, user);

        case "PUT":
          return putHandler(req, res, user);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "Method not allowed" });
      }
    },
  );
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  logger.log(`Looking up app with id '${req.query.appId}'`);
  const app = await prisma.app.findFirst({
    include: {
      messages: {
        include: {
          actions: true,
        },
        orderBy: [
          {
            startDate: "asc",
          },
          {
            endDate: "asc",
          },
        ],
      },
    },
    where: {
      id: Number(req.query.appId),
      orgId: Number(req.query.orgId),
    },
  });

  if (app == null) {
    logger.error(`No app found with id '${req.query.appId}'`);
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "No app found with id " + req.query.appId });
  }

  return res.status(StatusCodes.OK).json({
    role: user.role,
    publicKey: user.role === "ADMIN" ? app.publicKey : "",
    name: app.name,
    messages: app.messages,
  });
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  try {
    if (user.role === "USER") {
      logger.error(
        `You are not allowed to delete app with id '${req.query.appId}'`,
      );
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not allowed to delete app with id " + req.query.orgId,
      });
    }

    logger.log(`Deleting app with id '${req.query.appId}'`);
    const deletedApp = await prisma.app.delete({
      where: {
        id: Number(req.query.appId),
      },
    });

    return res.status(StatusCodes.OK).json(deletedApp);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`No app found with id '${req.query.appId}'`);
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No app found with id " + req.query.appId });
    }
    return res
      .status(StatusCodes.NOT_IMPLEMENTED)
      .json({ message: "Not implemented: unhandled response path" });
  }
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  try {
    if (user.role === "USER") {
      logger.error(
        `You are not allowed to update app with id '${req.query.appId}'`,
      );
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not allowed to update app with id " + req.query.orgId,
      });
    }

    logger.log(`Updating app with id '${req.query.appId}'`);
    const updatedApp = await prisma.app.update({
      where: {
        id: Number(req.query.appId),
      },
      data: {
        name: req.body.name,
      },
    });

    return res.status(StatusCodes.CREATED).json(updatedApp);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`No app found with id '${req.query.appId}'`);
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No app found with id " + req.query.appId });
    }

    logger.error(`Error: ${e}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json("An internal server error occurred, please try again later");
  }
}
