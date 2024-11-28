"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import type { OrgUser } from "@/models/org-user";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions:remove-user-from-org");

export const removeUserFromOrg = createAuthenticatedServerAction(
  async (
    session,
    {
      orgId,
      userId,
    }: {
      orgId: Org["id"];
      userId: OrgUser["id"];
    },
  ) => {
    logger.log(`Removing user with id '${userId}' from org with id '${orgId}'`);

    logger.verbose(`Verify user has access to remove user from org`);
    const currentUserWithOrg = await prisma.usersInOrganisations.findUnique({
      where: {
        orgId_userId: {
          orgId: orgId,
          userId: session.user.id,
        },
        org: {
          isDeleted: {
            not: true,
          },
        },
        user: {
          isDeleted: {
            not: true,
          },
        },
      },
    });
    if (!currentUserWithOrg) {
      throw new UnauthorizedError(
        `User does not have access to remove user from org with id '${orgId}'`,
      );
    }

    // If the user is not an admin, they can only remove themselves
    if (
      currentUserWithOrg.role === $Enums.Role.USER &&
      currentUserWithOrg.userId !== userId
    ) {
      throw new ForbiddenError(
        `You are not allowed to delete user with id '${userId}' from organisation with id '${orgId}'`,
      );
    }

    // If the user is an admin, they can remove themselves only if there is another admin in the org
    if (
      currentUserWithOrg.role === $Enums.Role.ADMIN &&
      currentUserWithOrg.userId === userId
    ) {
      logger.log(`Looking up all admins in org with id '${orgId}'`);

      const otherAdminsInOrg = await prisma.usersInOrganisations.findMany({
        where: {
          orgId: orgId,
          role: $Enums.Role.ADMIN,
          user: {
            // Exclude deleted users
            isDeleted: {
              not: true,
            },
            // Exclude the current user
            id: {
              not: currentUserWithOrg.userId,
            },
          },
        },
        include: {
          org: true,
        },
      });

      if (otherAdminsInOrg.length < 1) {
        throw new ForbiddenError(
          `At least one user must be an admin in organisation with id '${orgId}'`,
        );
      }
    }

    logger.log(`Deleting user with id '${userId}' from org with id '${orgId}'`);
    await prisma.usersInOrganisations.delete({
      where: {
        orgId_userId: {
          userId: userId,
          orgId: orgId,
        },
      },
    });
  },
);
