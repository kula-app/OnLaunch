"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { AppAdminToken } from "@/models/app-admin-token";
import prisma from "@/services/db";
import { encodeAppToken } from "@/util/adminApi/tokenEncoding";
import { generateToken } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions/create-app-admin-token");

export const createAppAdminToken = createAuthenticatedServerAction(
  async (
    session,
    {
      appId,
      label,
      expirationDate,
    }: {
      appId: number;
      label: string;
      expirationDate: Date | undefined;
    },
  ): Promise<AppAdminToken> => {
    logger.log(`Creating new app admin token for app id '${appId}'`);
    logger.verbose(
      `Verifying user(id = ${session.user.id}) has access to app(id = ${appId})`,
    );
    const appWithOrg = await prisma.app.findUnique({
      where: {
        id: appId,
        isDeleted: {
          not: true,
        },
      },
      // Include the organisation and users to check if the user has access to the app
      include: {
        organisation: {
          where: {
            isDeleted: {
              not: true,
            },
          },
          include: {
            users: {
              where: {
                userId: session.user.id,
                user: {
                  isDeleted: {
                    not: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!appWithOrg) {
      throw new UnauthorizedError(
        `User does not have access to app with id '${appId}'`,
      );
    }
    if (appWithOrg.organisation?.users?.[0].role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `User does not have permission to create tokens for app with id '${appId}'`,
      );
    }

    logger.verbose(`Creating new app admin token for app id '${appId}'`);
    const generatedToken = generateToken();

    const appAdminToken = await prisma.appAdminToken.create({
      data: {
        token: generatedToken,
        expiryDate: expirationDate,
        label: label,
        app: {
          connect: {
            id: appId,
          },
        },
      },
    });

    return {
      id: appAdminToken.id,
      token: encodeAppToken(appAdminToken.token),
      accessLevel: appAdminToken.role,
      label: appAdminToken.label,
      expiryDate: appAdminToken.expiryDate,
    };
  },
);
