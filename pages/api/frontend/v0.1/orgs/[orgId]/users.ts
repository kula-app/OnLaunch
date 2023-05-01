import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  generateToken,
  getUserWithRoleFromRequest,
  sendTokenPerMail,
} from "../../../../../../util/auth";
import { StatusCodes } from "http-status-codes";
import { UserDto } from "../../../../../../models/userDto";
import { MailType } from "../../../../../../models/mailType";

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
      const usersInOrg = await prisma.usersInOrganisations.findMany({
        include: {
          user: true,
        },
        where: {
          orgId: Number(req.query.orgId),
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (usersInOrg == null) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: "no users found in organisation with id " + req.query.orgId,
        });
        return;
      }

      res.status(StatusCodes.OK).json(
        usersInOrg.map((userInOrg): UserDto => {
          return {
            id: userInOrg.userId,
            firstName: userInOrg.user.firstName as string,
            lastName: userInOrg.user.lastName as string,
            email: userInOrg.user.email as string,
            role: userInOrg.role,
          };
        })
      );
      break;

    case "PUT":
      try {
        if (user.role === "USER") {
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "you are not allowed to update user with id " +
              req.query.userId +
              " from organisation with id " +
              req.query.orgId,
          });
          return;
        }

        if (user.id === req.body.userId) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "you cannot change your own role!" });
          return;
        }

        const updatedApp = await prisma.usersInOrganisations.update({
          where: {
            orgId_userId: {
              userId: Number(req.body.userId),
              orgId: Number(req.body.orgId),
            },
          },
          data: {
            role: req.body.role,
          },
        });

        res.status(StatusCodes.CREATED).json(updatedApp);
        return;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          res.status(StatusCodes.NOT_FOUND).json({
            message:
              "no user with id " +
              req.query.userId +
              " found in organisation with id " +
              req.query.appId,
          });
        }
      }
      break;

    case "POST":
      console.log("req.query.orgId: " + req.query.orgId)
      if (user.role === "USER") {
        res.status(StatusCodes.FORBIDDEN).json({
          message:
            "you are not allowed to add user with email " +
            req.body.email +
            " to organisation with id " +
            req.query.orgId,
        });
        return;
      }

      const generatedToken = generateToken();

      const userByEmail = await prisma.user.findFirst({
        where: {
          email: req.body.email,
          NOT: {
            isDeleted: true,
          },
        },
      });

      console.log("test");
      console.log("userByEmail: " + JSON.stringify(userByEmail));
      if (userByEmail && userByEmail.id) {
        const searchUserAlreadyInOrganisation =
          await prisma.usersInOrganisations.findFirst({
            where: {
              userId: userByEmail.id,
              orgId: Number(req.query.orgId),
            },
          });

        if (searchUserAlreadyInOrganisation) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "user already in organisation!" });
          return;
        }
      }

      console.log("test2");
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

      const uit = await prisma.userInvitationToken.create({
        data: {
          invitedEmail: req.body.email,
          token: generatedToken,
          orgId: Number(req.query.orgId),
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

      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
