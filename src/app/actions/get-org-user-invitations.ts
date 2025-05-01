"use server";

import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import type { OrgUserInvitation } from "@/models/org-user-invitation";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { PrismaDataUtils } from "@/util/prisma-data-utils";

const logger = new Logger("actions/get-org-user-invites");

export const getOrgUserInvitations = createAuthenticatedServerAction(
  async (session, { orgId }: { orgId: Org["id"] }) => {
    logger.log(`Looking up users in organisation with id '${orgId}'`);
    const userInOrg = await prisma.usersInOrganisations.findUnique({
      where: {
        orgId_userId: {
          orgId: orgId,
          userId: session.user.id,
        },
        // Ensure that the org and user are not deleted
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
      include: {
        org: {
          include: {
            userInvitationToken: {
              where: {
                isObsolete: false,
                isArchived: false,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });
    if (!userInOrg) {
      logger.error(`User has no access to organisation with id '${orgId}'`);
      throw new UnauthorizedError(`You are not allowed to access user invites`);
    }

    return userInOrg.org.userInvitationToken.map(
      (invitation): OrgUserInvitation => {
        return {
          id: invitation.userId,
          email: invitation.invitedEmail,
          role: PrismaDataUtils.mapUserRoleFromPrisma(invitation.role),
        };
      },
    );
  },
);
