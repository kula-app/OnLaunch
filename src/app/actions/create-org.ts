"use server";

import { OrgRole } from "@/models/org-role";
import prisma from "@/services/db";
import { generateToken } from "@/util/auth";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger("actions/create-org");

export const createOrg = createAuthenticatedServerAction(
  async (session, { name }: { name: string }) => {
    logger.log(
      `Creating new organisation for user with id '${session.user.id}'`,
    );
    const userInOrg = await prisma.usersInOrganisations.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        role: OrgRole.ADMIN,
        org: {
          create: {
            name: name,
            invitationToken: generateToken(),
          },
        },
      },
    });

    return userInOrg.orgId;
  },
);
