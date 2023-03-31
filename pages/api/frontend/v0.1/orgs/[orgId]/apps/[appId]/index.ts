import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { getSession } from "next-auth/react";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req: req });

  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized!" });
    return;
  }

  const id = session.user?.id;

  const userInOrg = await prisma.usersInOrganisations.findFirst({
    where: {
      user: {
        id: Number(id),
      },
      org: {
        id: Number(req.query.orgId),
      },
    },
    select: {
      role: true,
    },
  });

  if (userInOrg?.role !== "ADMIN" && userInOrg?.role !== "USER") {
    // if user has no business here, return a 404
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no organisation found with id " + req.query.orgId });
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
        role: userInOrg?.role,
        publicKey: userInOrg?.role === "ADMIN" ? app.publicKey : "",
        name: app.name,
        messages: app.messages,
      });
      break;

    case "DELETE":
      try {
        if (userInOrg?.role === "USER") {
          res
            .status(StatusCodes.FORBIDDEN)
            .json({
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
        if (userInOrg?.role === "USER") {
          res
            .status(StatusCodes.FORBIDDEN)
            .json({
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
