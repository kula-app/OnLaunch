import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserFromRequest } from "../../../../../../../util/auth";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUserFromRequest(req, res, prisma);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "DELETE":
      try {
        if (
          user.role === "USER" &&
          user.id !== Number(req.query.userId)
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
          user.role === "ADMIN" &&
          user.id === Number(req.query.userId)
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
