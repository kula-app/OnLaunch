"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { generateToken } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions/reset-org-invitation-token");

export const resetOrgInvitationToken = createAuthenticatedServerAction(
  async (session, { orgId }: { orgId: Org["id"] }) => {
    logger.log(`Resetting org invitation token for org id '${orgId}'`);

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
        `You do not have permission to reset the invitation token`,
      );
    }

    const token = generateToken();
    await prisma.organisation.update({
      where: {
        id: orgId,
      },
      data: {
        invitationToken: token,
      },
    });
  },
);
