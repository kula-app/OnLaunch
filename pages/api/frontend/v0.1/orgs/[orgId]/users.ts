import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { MailType } from "../../../../../../models/mailType";
import { UserDto } from "../../../../../../models/userDto";
import {
  generateToken,
  getUserWithRoleFromRequest,
  sendTokenPerMail,
} from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res);

  if (!user) {
    return;
  }

  const orgId = Number(req.query.orgId);

  switch (req.method) {
    case "GET":
      logger.log(`Looking up users in organisation with id '${orgId}'`);
      const usersInOrg = await prisma.usersInOrganisations.findMany({
        include: {
          user: true,
        },
        where: {
          orgId: orgId,
          org: {
            isDeleted: false,
          },
          user: {
            isDeleted: false,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (usersInOrg == null) {
        logger.error(`No users found in organisation with id '${orgId}'`);
        res.status(StatusCodes.NOT_FOUND).json({
          message: "No users found in organisation with id " + orgId,
        });
        return;
      }

      logger.log(
        `Looking up user direct invites for organisation with id '${orgId}'`
      );
      const userInvitationsInOrg = await prisma.userInvitationToken.findMany({
        where: {
          orgId: orgId,
          isObsolete: false,
          isArchived: false,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const users = usersInOrg.map((userInOrg): UserDto => {
        return {
          id: userInOrg.userId,
          firstName: userInOrg.user.firstName as string,
          lastName: userInOrg.user.lastName as string,
          email: userInOrg.user.email as string,
          role: userInOrg.role,
        };
      });

      const usersInvited = userInvitationsInOrg.map((invite): UserDto => {
        return {
          id: -1,
          firstName: "(pending)",
          lastName: "",
          email: invite.invitedEmail,
          role: invite.role,
        };
      });

      // combine user list with pending invites list
      res.status(StatusCodes.OK).json([...users, ...usersInvited]);
      break;

    case "PUT":
      if (user.role === "USER") {
        logger.error(
          `You are not allowed to update user with id '${req.body.userId}' in organisation with id '${orgId}'`
        );
        res.status(StatusCodes.FORBIDDEN).json({
          message:
            "You are not allowed to update user with id " +
            req.body.userId +
            " in organisation with id " +
            orgId,
        });
        return;
      }

      if (user.id === req.body.userId) {
        logger.error("You cannot change your own role");
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "You cannot change your own role" });
        return;
      }

      try {
        logger.log(
          `Updating role of user with id '${req.body.userId}' in organisation with id '${orgId}'`
        );
        const updatedApp = await prisma.usersInOrganisations.update({
          where: {
            orgId_userId: {
              userId: Number(req.body.userId),
              orgId: orgId,
            },
            org: {
              isDeleted: false,
            },
          },
          data: {
            role: req.body.role,
          },
        });

        res.status(StatusCodes.OK).json(updatedApp);
        return;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(
            `No user with id '${req.body.userId}' found in organisation with id '${orgId}'`
          );
          res.status(StatusCodes.NOT_FOUND).json({
            message:
              "No user with id " +
              req.body.userId +
              " found in organisation with id " +
              orgId,
          });
        }
      }
      break;

    case "POST":
      if (user.role === "USER") {
        logger.error(
          `You are not allowed to add user with email '${req.body.email}' to organisation with id '${orgId}'`
        );
        res.status(StatusCodes.FORBIDDEN).json({
          message:
            "You are not allowed to add user with email " +
            req.body.email +
            " to organisation with id " +
            orgId,
        });
        return;
      }

      const generatedToken = generateToken();

      logger.log(`Looking up user with email '${req.body.email}'`);
      const userByEmail = await prisma.user.findFirst({
        where: {
          email: req.body.email,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (userByEmail && userByEmail.id) {
        logger.log(
          `Looking up user with id '${userByEmail.id}' in organisation with id '${orgId}'`
        );
        const searchUserAlreadyInOrganisation =
          await prisma.usersInOrganisations.findFirst({
            where: {
              userId: userByEmail.id,
              orgId: orgId,
            },
            include: {
              org: true,
            },
          });

        if (searchUserAlreadyInOrganisation) {
          // Check if organisation has already been deleted
          if (searchUserAlreadyInOrganisation.org.isDeleted) {
            logger.error(`Organisation with id '${orgId}' has been deleted`);
            return res
              .status(StatusCodes.NOT_FOUND)
              .json({ message: `No organisation found with id '${orgId}'` });
          }

          logger.error("User already in organisation");
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "User already in organisation!" });
        }
      }

      logger.log("Updating previous user invitation tokens as obsolete");
      await prisma.userInvitationToken.updateMany({
        where: {
          invitedEmail: req.body.email,
          isObsolete: false,
        },
        data: {
          isObsolete: true,
        },
      });

      var expiryDate = new Date();
      // set expiryDate one hour from now
      expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000);

      logger.log(
        `Creating user invitation token for email '${req.body.email}' for organisation with id '${orgId}'`
      );
      const uit = await prisma.userInvitationToken.create({
        data: {
          invitedEmail: req.body.email,
          token: generatedToken,
          orgId: orgId,
          userId: user.id,
          expiryDate: expiryDate,
        },
      });

      sendTokenPerMail(
        req.body.email as string,
        userByEmail ? (userByEmail.firstName as string) : "",
        generatedToken,
        userByEmail ? MailType.DirectInvite : MailType.DirectInviteNewUser
      );

      res.status(StatusCodes.CREATED).json(uit);
      return;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
