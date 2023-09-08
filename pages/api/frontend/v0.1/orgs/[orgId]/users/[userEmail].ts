import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserWithRoleFromRequest } from "../../../../../../../util/auth";
import { Logger } from "../../../../../../../util/logger";

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
    case "DELETE":
      if (user.role === "USER" && user.email !== req.query.userEmail) {
        logger.error(
          `You are not allowed to delete user with email '${req.query.userEmail}' from organisation with id '${req.query.orgId}'`
        );
        res.status(StatusCodes.FORBIDDEN).json({
          message:
            "You are not allowed to delete user with email " +
            req.query.userEmail +
            " from organisation with id " +
            req.query.orgId,
        });
        return;
      }

      if (user.role === "ADMIN" && user.email === req.query.userEmail) {
        logger.log(`Looking up all admins in org with id '${req.query.orgId}'`);
        const otherAdminsInOrg = await prisma.usersInOrganisations.findMany({
          where: {
            orgId: Number(req.query.orgId),
            role: "ADMIN",
          },
        });

        if (otherAdminsInOrg.length === 1) {
          logger.error("Organisation cannot be left by the only admin");
          res.status(StatusCodes.BAD_REQUEST).json({
            message:
              "You cannot leave organisation when you are the only admin",
          });
          return;
        }
      }

      logger.log(`Looking up user with email '${req.query.userEmail}'`);
      const userByEmail = await prisma.user.findFirst({
        where: {
          email: req.query.userEmail as string,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (userByEmail && userByEmail.id) {
        logger.log(`Looking up user in org with id '${req.query.orgId}'`);
        const userInOrg = await prisma.usersInOrganisations.findUnique({
          where: {
            orgId_userId: {
              userId: Number(userByEmail?.id),
              orgId: Number(req.query.orgId),
            },
          },
        });

        if (userInOrg && userInOrg.userId) {
          logger.log(
            `Deleting user with id '${userInOrg.userId}' from org with id '${req.query.orgId}'`
          );
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

      // if deletion is for a pending invitation
      try {
        logger.log(
          `Deleting user direct invite for email '${req.query.userEmail}' for org with id '${req.query.orgId}'`
        );
        const deletedUserInvite = await prisma.userInvitationToken.deleteMany({
          where: {
            invitedEmail: req.query.userEmail as string,
            isObsolete: false,
            orgId: Number(req.query.orgId),
          },
        });

        res.status(StatusCodes.OK).json(deletedUserInvite);
      } catch (e) {
        logger.log(
          `No user invite for email '${req.query.userEmail}' found in organisation with id '${req.query.orgId}'`
        );
        res.status(StatusCodes.NOT_FOUND).json({
          message:
            "No user invite for email " +
            req.query.userEmail +
            " found in organisation with id " +
            req.query.orgId,
        });
      }
      break;

    case "PUT":
      if (user.role === "USER") {
        logger.error(
          `You are not allowed to update user invite with email '${req.query.userEmail}' in organisation with id '${req.query.orgId}'`
        );
        res.status(StatusCodes.FORBIDDEN).json({
          message:
            "You are not allowed to update user invite with email " +
            req.body.userEmail +
            " in organisation with id " +
            req.query.orgId,
        });
        return;
      }

      if (user.email === req.body.userEmail) {
        logger.error("You cannot change your own role");
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "You cannot change your own role" });
        return;
      }

      try {
        logger.log(
          `Updating role of user invite with email '${req.body.userEmail}' in organisation with id '${req.query.orgId}'`
        );
        const updatedInvite = await prisma.userInvitationToken.updateMany({
          where: {
            invitedEmail: req.body.userEmail as string,
            orgId: Number(req.query.orgId),
            isObsolete: false,
            isArchived: false,
          },
          data: {
            role: req.body.role,
          },
        });

        res.status(StatusCodes.CREATED).json(updatedInvite);
        return;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(
            `No user invite with email '${req.body.userEmail}' found in organisation with id '${req.query.orgId}'`
          );
          res.status(StatusCodes.NOT_FOUND).json({
            message:
              "No user with email " +
              req.body.userEmail +
              " found in organisation with id " +
              req.query.orgId,
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
