"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import type { OrgAdminToken } from "@/models/org-admin-token";
import prisma from "@/services/db";
import { encodeOrgToken } from "@/util/adminApi/tokenEncoding";
import { generateToken } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger(__filename);

export const createOrgAdminToken = createAuthenticatedServerAction(
  async (
    session,
    {
      orgId,
      label,
    }: {
      orgId: Org["id"];
      label: string;
    },
  ): Promise<OrgAdminToken> => {
    logger.log(`Creating new organisation admin token for org id '${orgId}'`);
    logger.verbose(
      `Verifying user(id = ${session.user.id}) has access to org(id = ${orgId})`,
    );
    const org = await prisma.usersInOrganisations.findUnique({
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
    });
    if (!org) {
      throw new UnauthorizedError(
        `User does not have access to org with id '${orgId}'`,
      );
    }
    if (org.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenError(
        `User does not have permission to create tokens for org with id '${orgId}'`,
      );
    }

    logger.verbose(`Creating new org admin token for org id '${orgId}'`);
    const generatedToken = generateToken();
    const orgAdminToken = await prisma.organisationAdminToken.create({
      data: {
        token: generatedToken,
        orgId: orgId,
        label: label,
      },
    });
    logger.verbose(`Created org admin token with id '${orgAdminToken.id}'`);

    return {
      id: orgAdminToken.id,
      token: encodeOrgToken(orgAdminToken.token),
      label: orgAdminToken.label,
    };
  },
);
