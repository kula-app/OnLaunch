import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserWithRoleFromRequest } from "../../../../../../../../util/auth";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
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
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "no app found with id " + req.query.appId });
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
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "you are not allowed to delete app with id " + req.query.orgId,
          });
          return;
        }
        const deletedApp = await prisma.app.delete({
          where: {
            id: Number(req.query.appId),
          },
        });

        res.status(StatusCodes.OK).json(deletedApp);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "no app found with id " + req.query.appId });
        }
      }
      break;

    case "PUT":
      try {
        if (user.role === "USER") {
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "you are not allowed to update app with id " + req.query.orgId,
          });
          return;
        }
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
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "no app found with id " + req.query.appId });
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
