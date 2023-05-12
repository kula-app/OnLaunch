import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserWithRoleFromRequest } from "../../../../../../../../util/auth";
import { Logger } from "../../../../../../../../util/logger";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
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
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "No app found with id " + req.query.appId });
        return;
      }

      res.status(StatusCodes.OK).json({
        role: user.role,
        publicKey: user.role === "ADMIN" ? app.publicKey : "",
        name: app.name,
        messages: app.messages,
      });
      break;

    case "DELETE":
      try {
        if (user.role === "USER") {
          logger.error(
            `You are not allowed to delete app with id '${req.query.appId}'`
          );
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "You are not allowed to delete app with id " + req.query.orgId,
          });
          return;
        }

        logger.log(`Deleting app with id '${req.query.appId}'`);
        const deletedApp = await prisma.app.delete({
          where: {
            id: Number(req.query.appId),
          },
        });

        res.status(StatusCodes.OK).json(deletedApp);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(`No app found with id '${req.query.appId}'`);
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "No app found with id " + req.query.appId });
        }
      }
      break;

    case "PUT":
      try {
        if (user.role === "USER") {
          logger.error(
            `You are not allowed to update app with id '${req.query.appId}'`
          );
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "You are not allowed to update app with id " + req.query.orgId,
          });
          return;
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

        res.status(StatusCodes.CREATED).json(updatedApp);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(`No app found with id '${req.query.appId}'`);
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "No app found with id " + req.query.appId });
        }
      }
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
