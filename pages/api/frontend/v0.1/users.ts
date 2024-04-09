import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/services/db";
import { User } from "../../../../models/user";
import { authenticatedHandler } from "../../../../util/authenticatedHandler";
import { Logger } from "../../../../util/logger";

const logger = new Logger(__filename);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return authenticatedHandler(
    req,
    res,
    { method: "basic" },
    async (req, res, user) => {
      switch (req.method) {
        case "GET":
          return getHandler(req, res, user);
        case "DELETE":
          return deleteHandler(req, res, user);
        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "Method not allowed" });
      }
    }
  );
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
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
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User not found!" });
  }

  return res.status(StatusCodes.CREATED).json({
    email: userFromDb.email,
    firstName: userFromDb.firstName,
    lastName: userFromDb.lastName,
  });
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User
) {
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
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User not found!" });
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
}
