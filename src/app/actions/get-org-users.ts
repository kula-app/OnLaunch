"use server";

import { NotFoundError } from "@/errors/not-found-error";
import { OrgRole } from "@/models/org-role";
import type { OrgUser } from "@/models/org-user";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";

const logger = new Logger("actions:get-org-users");

export const getOrgUsers = createAuthenticatedServerAction(
  async (session, { orgId }: { orgId: number }) => {
    logger.log(`Looking up users in organisation with id '${orgId}'`);
    const usersInOrg = await prisma.usersInOrganisations.findMany({
      include: {
        user: true,
      },
      where: {
        orgId: orgId,
        org: {
          isDeleted: false,
        },
        user: {
          isDeleted: false,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (usersInOrg == null) {
      logger.error(`No users found in organisation with id '${orgId}'`);
      throw new NotFoundError(
        `No users found in organisation with id ${orgId}`,
      );
    }

    return usersInOrg.map((userInOrg): OrgUser => {
      let role: OrgRole;
      switch (userInOrg.role) {
        case $Enums.Role.ADMIN:
          role = OrgRole.ADMIN;
          break;
        case $Enums.Role.USER:
          role = OrgRole.USER;
          break;
        default:
          role = OrgRole.USER;
          break;
      }
      return {
        id: userInOrg.userId,
        firstName: userInOrg.user.firstName,
        lastName: userInOrg.user.lastName,
        email: userInOrg.user.email,
        role: role,
      };
    });
  },
);
