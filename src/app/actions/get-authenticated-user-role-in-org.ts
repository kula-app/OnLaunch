"use server";

import { SessionNotFoundError } from "@/errors/session-not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import { OrgRole } from "@/models/org-role";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { $Enums } from "@prisma/client";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const getAuthenticatedUserRoleInOrg = createServerAction(
  async (orgId: number): Promise<OrgRole> => {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new SessionNotFoundError();
    }

    logger.verbose(
      `Fetching authenticated in organization(id = ${orgId}) for user(id = ${session.user.id})`,
    );
    // Access the organization via the user mapping to ensure the user has access to the organization
    const org = await prisma.usersInOrganisations.findFirst({
      where: {
        user: {
          id: session.user.id,
          isDeleted: false,
        },
        org: {
          id: orgId,
          isDeleted: false,
        },
      },
    });
    if (!org) {
      throw new UnauthorizedError("User is not a member of the organization");
    }

    switch (org.role) {
      case $Enums.Role.ADMIN:
        return OrgRole.ADMIN;
      case $Enums.Role.USER:
        return OrgRole.USER;
    }
  },
);
