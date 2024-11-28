"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { OrgAdminToken } from "@/models/org-admin-token";
import { OrgRole } from "@/models/org-role";
import prisma from "@/services/db";
import { encodeOrgToken } from "@/util/adminApi/tokenEncoding";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(__filename);

export const getOrgAdminTokens = createAuthenticatedServerAction(
  async (session, orgId: number): Promise<OrgAdminToken[]> => {
    logger.verbose(
      `Fetching organization(id = ${orgId}) for user(id = ${session.user.id})`,
    );

    logger.log(`Looking up admin tokens for org with id(=${orgId})`);
    const orgWithTokens = await prisma.usersInOrganisations.findUnique({
      where: {
        orgId_userId: {
          orgId: orgId,
          userId: session.user.id,
        },
        user: {
          isDeleted: {
            not: true,
          },
        },
        org: {
          isDeleted: {
            not: true,
          },
        },
      },
      include: {
        org: {
          include: {
            organisationAdminToken: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
    });
    if (!orgWithTokens) {
      throw new UnauthorizedError(
        `You are not authorized to view this organisation`,
      );
    }
    if (orgWithTokens.role !== OrgRole.ADMIN) {
      throw new ForbiddenError(
        `You do not have permission to view authorization tokens for this organisation`,
      );
    }

    return orgWithTokens.org.organisationAdminToken.map(
      (token): OrgAdminToken => ({
        id: token.id,
        token: encodeOrgToken(token.token),
        label: token.label,
      }),
    );
  },
);
