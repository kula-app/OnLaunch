"use server";

import { BadRequestError } from "@/errors/bad-request-error";
import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import type { OrgUser } from "@/models/org-user";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums, Prisma } from "@prisma/client";

const logger = new Logger("actions/update-user-role-in-org");

export const updateUserRoleInOrg = createAuthenticatedServerAction(
  async (
    session,
    {
      orgId,
      userId,
      role,
    }: {
      orgId: Org["id"];
      userId: OrgUser["id"];
      role: OrgRole;
    },
  ) => {
    const authenticatedUserWithOrg =
      await prisma.usersInOrganisations.findUnique({
        where: {
          orgId_userId: {
            orgId,
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
    if (!authenticatedUserWithOrg) {
      throw new UnauthorizedError(
        `You do not have access to this organisation`,
      );
    }
    if (authenticatedUserWithOrg.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `You do not have permission to update the user role`,
      );
    }

    if (userId === session.user.id) {
      throw new BadRequestError("You cannot change your own role");
    }

    try {
      logger.log(
        `Updating role of user with id '${userId}' in organisation with id '${orgId}' to role '${role}'`,
      );
      let mappedRole: $Enums.Role;
      switch (role) {
        case OrgRole.ADMIN:
          mappedRole = $Enums.Role.ADMIN;
          break;
        case OrgRole.USER:
          mappedRole = $Enums.Role.USER;
          break;
        default:
          throw new BadRequestError("Invalid role");
      }
      const updatedApp = await prisma.usersInOrganisations.update({
        where: {
          orgId_userId: {
            userId: userId,
            orgId: orgId,
          },
        },
        data: {
          role: mappedRole,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new NotFoundError("User not found in organisation");
      }

      throw e;
    }
  },
);
