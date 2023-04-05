import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

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
  });

  if (userInOrg?.role !== "ADMIN" && userInOrg?.role !== "USER") {
    // if user has no business with this organisation, return a 404
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no organisation found with id " + req.query.orgId });
    return;
  }

  switch (req.method) {
    case "DELETE":
      try {
        if (
          userInOrg?.role === "USER" &&
          userInOrg?.userId !== Number(req.query.userId)
        ) {
          res
            .status(StatusCodes.FORBIDDEN)
            .json({
              message:
                "you are not allowed to delete user with id " +
                req.query.userId +
                " from organisation with id " +
                req.query.orgId,
            });
          return;
        }

        if (
          userInOrg?.role === "ADMIN" &&
          userInOrg?.userId === Number(req.query.userId)
        ) {
          const otherAdminsInOrg = await prisma.usersInOrganisations.findMany({
            where: {
              orgId: Number(req.query.orgId),
              role: "ADMIN",
            },
          });

          if (otherAdminsInOrg.length === 1) {
            res
              .status(StatusCodes.BAD_REQUEST)
              .json({
                message:
                  "you cannot leave organisation when you are the only admin!",
              });
            return;
          }
        }

        const deletedUserInOrg = await prisma.usersInOrganisations.delete({
          where: {
            orgId_userId: {
              userId: Number(req.query.userId),
              orgId: Number(req.query.orgId),
            },
          },
        });

        res.status(StatusCodes.OK).json(deletedUserInOrg);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          res
            .status(StatusCodes.NOT_FOUND)
            .json({
              message:
                "no user with id " +
                req.query.userId +
                " found in organisation with id " +
                req.query.appId,
            });
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
