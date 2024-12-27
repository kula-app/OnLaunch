"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { NotFoundError } from "@/errors/not-found-error";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import type { Session } from "next-auth";

const logger = new Logger("actions/get-user");

export const deleteUser = createAuthenticatedServerAction(
  async (session: Session) => {
    logger.log(`Looking up user with id '${session.user.id}'`);
    const userByEmail = await prisma.user.findFirst({
      where: {
        email: session.user.email,
        NOT: {
          isDeleted: true,
        },
      },
    });

    if (!userByEmail || (userByEmail && !userByEmail.id)) {
      logger.error(`No user found with email '${session.user.email}'`);
      throw new NotFoundError("User not found!");
    }

    logger.log(
      `Looking up organisations that user with id '${userByEmail.id}' is part of`,
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
      `Looking up other admins in organisations that user with id '${userByEmail.id}' is part of`,
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
      }),
    );

    if (orgsToDeleteFirst.length) {
      logger.error(
        `Before deleting user profile of user with id '${
          userByEmail.id
        }', these organisations have to be deleted first: ${JSON.stringify(
          orgsToDeleteFirst,
        )}`,
      );
      throw new BadRequestError(
        "You have to delete these organisations first: " +
          JSON.stringify(orgsToDeleteFirst),
      );
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
      `Deleting relations for all organisations that user with id '${deletedUser.id}' is in`,
    );
    // delete user from organisations
    await prisma.usersInOrganisations.deleteMany({
      where: {
        userId: deletedUser.id,
      },
    });
  },
);
