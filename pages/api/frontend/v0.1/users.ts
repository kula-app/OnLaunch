import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/services/db";
import { getUserFromRequest } from "../../../../util/auth";
import { Logger } from "../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
      logger.log(`Looking up user with id '${user.id}'`);
      const userFromDb = await prisma.user.findFirst({
        where: {
          id: Number(user.id),
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!userFromDb || (userFromDb && !userFromDb.id)) {
        logger.error(`No user found with id '${user.id}'`);
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
        return;
      }

      return res.status(StatusCodes.CREATED).json({
        email: userFromDb.email,
        firstName: userFromDb.firstName,
        lastName: userFromDb.lastName,
      });

    case "DELETE":
      const userEmail = user.email as string;

      logger.log(`Looking up user with email '${userEmail}'`);
      const userByEmail = await prisma.user.findFirst({
        where: {
          email: userEmail,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!userByEmail || (userByEmail && !userByEmail.id)) {
        logger.error(`No user found with email '${userEmail}'`);
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
        return;
      }

      logger.log(
        `Looking up organisations that user with id '${userByEmail.id}' is part of`
      );
      // check if user is qualified to be deleted
      const userInOrgs = await prisma.usersInOrganisations.findMany({
        where: {
          user: {
            id: userByEmail.id,
          },
          role: "ADMIN",
        },
        include: {
          org: true,
        },
      });

      let orgsToDeleteFirst: Array<string> = [];

      logger.log(
        `Looking up other admins in organisations that user with id '${userByEmail.id}' is part of`
      );
      await Promise.all(
        userInOrgs.map(async (userInOrg) => {
          const otherAdminsInOrg = await prisma.usersInOrganisations.findMany({
            where: {
              orgId: userInOrg.orgId,
              role: "ADMIN",
              NOT: {
                userId: userInOrg.userId,
              },
            },
          });

          if (Array.isArray(otherAdminsInOrg) && !otherAdminsInOrg.length) {
            orgsToDeleteFirst.push(userInOrg.org.name);
          }
        })
      );

      if (orgsToDeleteFirst.length) {
        logger.error(
          `Before deleting user profile of user with id '${
            userByEmail.id
          }', these organisations have to be deleted first: ${JSON.stringify(
            orgsToDeleteFirst
          )}`
        );
        return res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "You have to delete these organisations first: " +
            JSON.stringify(orgsToDeleteFirst),
        });
      }

      logger.log(`Updating user with id '${userByEmail.id}' as deleted`);
      // if user qualifies to be deleted:
      const deletedUser = await prisma.user.update({
        where: {
          id: userByEmail.id,
        },
        data: {
          email: null,
          firstName: null,
          lastName: null,
          password: null,
          salt: null,
          isDeleted: true,
        },
      });

      logger.log(
        `Deleting relations for all organisations that user with id '${deletedUser.id}' is in`
      );
      // delete user from organisations
      await prisma.usersInOrganisations.deleteMany({
        where: {
          userId: deletedUser.id,
        },
      });

      return res.status(StatusCodes.CREATED).json({ deletedUser });

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
