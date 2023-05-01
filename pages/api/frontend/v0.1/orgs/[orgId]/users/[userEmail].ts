import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserWithRoleFromRequest } from "../../../../../../../util/auth";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "DELETE":
      if (user.role === "USER" && user.email !== req.query.userEmail) {
        res.status(StatusCodes.FORBIDDEN).json({
          message:
            "you are not allowed to delete user with email " +
            req.query.userEmail +
            " from organisation with id " +
            req.query.orgId,
        });
        return;
      }

      if (user.role === "ADMIN" && user.email === req.query.userEmail) {
        const otherAdminsInOrg = await prisma.usersInOrganisations.findMany({
          where: {
            orgId: Number(req.query.orgId),
            role: "ADMIN",
          },
        });

        if (otherAdminsInOrg.length === 1) {
          res.status(StatusCodes.BAD_REQUEST).json({
            message:
              "you cannot leave organisation when you are the only admin!",
          });
          return;
        }
      }

      const userByEmail = await prisma.user.findFirst({
        where: {
          email: req.query.userEmail as string,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (userByEmail && userByEmail.id) {
        const userInOrg = await prisma.usersInOrganisations.findUnique({
          where: {
            orgId_userId: {
              userId: Number(userByEmail?.id),
              orgId: Number(req.query.orgId),
            },
          },
        });

        if (userInOrg && userInOrg.userId) {
          const deletedUserInOrg = await prisma.usersInOrganisations.delete({
            where: {
              orgId_userId: {
                userId: userInOrg.userId,
                orgId: Number(req.query.orgId),
              },
            },
          });

          res.status(StatusCodes.OK).json(deletedUserInOrg);
        }
      }

      try {
        const deletedUserInvite = await prisma.userInvitationToken.deleteMany({
          where: {
            invitedEmail: req.query.userEmail as string,
            isObsolete: false,
          },
        });

        res.status(StatusCodes.OK).json(deletedUserInvite);
      } catch (e) {
        res.status(StatusCodes.NOT_FOUND).json({
          message:
            "no user with id " +
            req.query.userId +
            " found in organisation with id " +
            req.query.orgId,
        });
      }

      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
