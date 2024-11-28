"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import type { OrgRole } from "@/models/org-role";
import type { OrgUserInvitation } from "@/models/org-user-invitation";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums, Prisma } from "@prisma/client";

const logger = new Logger("actions/update-user-invite-role-in-org");

export const updateUserInviteRoleInOrg = createAuthenticatedServerAction(
  async (
    session,
    {
      orgId,
      invitationId,
      role,
    }: {
      orgId: Org["id"];
      invitationId: OrgUserInvitation["id"];
      role: OrgRole;
    },
  ) => {
    logger.log(
      `Updating role of user invitation with id '${invitationId}' in organisation with id '${orgId}' to '${role}'`,
    );

    logger.verbose(
      "Checking if user is allowed to update user invite role in org",
    );
    const userWithOrg = await prisma.usersInOrganisations.findUnique({
      where: {
        orgId_userId: {
          userId: session.user.id,
          orgId,
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
    if (!userWithOrg) {
      throw new UnauthorizedError(
        "You do not have access to this organisation",
      );
    }
    if (userWithOrg.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        "You do not have permission to update user invite role in this organisation",
      );
    }

    logger.verbose("Updating user invite role in org");
    try {
      await prisma.userInvitationToken.update({
        where: {
          id: invitationId,
        },
        data: {
          role: role,
        },
      });
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new NotFoundError("User invitation not found");
      }

      throw e;
    }
  },
);
