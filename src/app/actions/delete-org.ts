"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions:update-org");

export const deleteOrg = createAuthenticatedServerAction(
  async (session, orgId: number): Promise<void> => {
    try {
      logger.log(`Deleting org(id = ${orgId})`);
      logger.verbose(
        `Verifying user has permission to delete org(id = ${orgId})`,
      );
      const org = await prisma.organisation.findUnique({
        where: {
          id: orgId,
        },
        select: {
          users: {
            where: {
              userId: session.user.id,
              role: $Enums.Role.ADMIN,
            },
          },
        },
      });
      if (!org) {
        throw new ForbiddenError(
          `Authenticated user does not have permission to delete org with id ${orgId}`,
        );
      }
      if (!org?.users?.[0]) {
        logger.warn(
          `User(id = ${session.user.id}) does not have permission to delete org(id = ${orgId})`,
        );
        throw new ForbiddenError(
          `Authenticated user does not have permission to delete org with id ${orgId}`,
        );
      }

      logger.verbose(`Deleting org(id = ${orgId})`);
      await prisma.organisation.update({
        where: {
          id: orgId,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
      logger.verbose(`Deleted org(id = ${orgId})`);
    } catch (e) {
      logger.error(`Internal server error occurred: ${e}`);
      throw e;
    }
  },
);
