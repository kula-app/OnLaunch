"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { App } from "@/models/app";
import { AppAccessLevel } from "@/models/app-access-level";
import type { AppAdminToken } from "@/models/app-admin-token";
import prisma from "@/services/db";
import { encodeAppToken } from "@/util/adminApi/tokenEncoding";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger(`actions/get-app-admin-tokens`);

export const getAppAdminTokens = createAuthenticatedServerAction(
  async (session, { appId }: { appId: App["id"] }) => {
    logger.log(`Looking up admin tokens for app(id = ${appId})`);
    logger.verbose(`Validating user has access to app`);
    const app = await prisma.app.findFirst({
      where: {
        id: appId,
        isDeleted: {
          not: true,
        },
        organisation: {
          isDeleted: {
            not: true,
          },
        },
      },
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
    });
    if (!app) {
      throw new NotFoundError(`App not found`);
    }
    if (!app.organisation?.users?.[0]) {
      throw new UnauthorizedError(`You do not have access to this app`);
    }
    if (app.organisation?.users[0].role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `You do not have access to admin access tokens of this app`,
      );
    }

    const appAdminTokens = await prisma.appAdminToken.findMany({
      where: {
        appId: appId,
        isDeleted: false,
        // Exclude temporary tokens, as they are not meant to be listed and only used internally
        role: {
          not: $Enums.AppAccessLevel.TEMP,
        },
        OR: [
          {
            // Include tokens without expiration date
            expiryDate: null,
          },
          {
            // Include tokens that have not expired yet
            expiryDate: {
              gt: new Date(),
            },
          },
        ],
      },
    });

    return appAdminTokens.map((appAdminToken): AppAdminToken => {
      let accessLevel: AppAccessLevel;
      switch (appAdminToken.role) {
        case $Enums.AppAccessLevel.FULL:
          accessLevel = AppAccessLevel.FULL;
          break;
        case $Enums.AppAccessLevel.TEMP:
          accessLevel = AppAccessLevel.TEMP;
          break;
        default:
          throw new Error(`Unexpected app access level: ${appAdminToken.role}`);
      }

      return {
        id: appAdminToken.id,
        token: encodeAppToken(appAdminToken.token),
        accessLevel: accessLevel,
        label: appAdminToken.label ? appAdminToken.label : "",
        expiryDate: appAdminToken.expiryDate ? appAdminToken.expiryDate : null,
      };
    });
  },
);
