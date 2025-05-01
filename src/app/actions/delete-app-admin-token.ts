"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { AppAdminToken } from "@/models/app-admin-token";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions/delete-app-admin-token");

export const deleteAppAdminToken = createAuthenticatedServerAction(
  async (session, { tokenId }: { tokenId: AppAdminToken["id"] }) => {
    logger.log(`Deleting app admin token with id '${tokenId}'`);

    logger.verbose(`Verify the user has permission to delete the token`);
    const token = await prisma.appAdminToken.findUnique({
      where: {
        id: tokenId,
        app: {
          isDeleted: {
            not: true,
          },
        },
      },
      include: {
        app: {
          include: {
            organisation: {
              include: {
                users: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!token) {
      throw new NotFoundError(`App admin token with id '${tokenId}' not found`);
    }
    if (!token.app?.organisation?.users?.[0]) {
      throw new UnauthorizedError(`You do not have access to this token`);
    }
    if (token.app.organisation.users[0].role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `You do not have permission to delete this token`,
      );
    }

    logger.verbose(`Soft-deleting the token with id '${tokenId}'`);
    await prisma.appAdminToken.update({
      where: {
        id: tokenId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    logger.verbose(`Token with id '${tokenId}' has been soft-deleted`);
  },
);
