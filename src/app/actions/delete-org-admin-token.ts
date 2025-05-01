"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { NotFoundError } from "@/errors/not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import type { OrgAdminToken } from "@/models/org-admin-token";
import { OrgRole } from "@/models/org-role";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { Prisma } from "@prisma/client";

const logger = new Logger("actions/delete-org-admin-token");

export const deleteOrgAdminToken = createAuthenticatedServerAction(
  async (
    session,
    { orgId, tokenId }: { orgId: Org["id"]; tokenId: OrgAdminToken["id"] },
  ) => {
    try {
      logger.log(
        `Deleting organisation admin token with id '${tokenId}' for org id '${orgId}'`,
      );
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
      if (org.role !== OrgRole.ADMIN) {
        throw new ForbiddenError(
          `User does not have permission to delete tokens for org with id '${orgId}'`,
        );
      }

      const orgAdminToken = await prisma.organisationAdminToken.update({
        where: {
          id: tokenId,
          orgId: orgId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      return {
        id: orgAdminToken.id,
        token: orgAdminToken.token,
        label: orgAdminToken.label,
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        throw new NotFoundError(
          `No org admin token found with id '${tokenId}'`,
        );
      }

      throw e;
    }
  },
);
