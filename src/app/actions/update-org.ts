"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions:update-org");

export const updateOrg = createAuthenticatedServerAction(
  async (
    session,
    orgId: number,
    data: {
      name: string;
    },
  ): Promise<void> => {
    logger.log(
      `Updating organization(id = ${orgId}) for user(id = ${session.user.id})`,
    );
    // Access the organization via the user mapping to ensure the user has access to the organization
    const org = await prisma.usersInOrganisations.findUnique({
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
    if (!org) {
      throw new UnauthorizedError(`User does not have access to organization`);
    }
    if (org.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `User does not have permission to update organization`,
      );
    }

    logger.verbose(`Updating organization(id = ${orgId})`);
    await prisma.organisation.update({
      where: {
        id: orgId,
      },
      data: {
        name: data.name,
      },
    });
    logger.verbose(`Updated organization(id = ${orgId})`);
  },
);
