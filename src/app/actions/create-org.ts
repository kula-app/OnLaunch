"use server";

import { SessionNotFoundError } from "@/errors/session-not-found-error";
import prisma from "@/services/db";
import { generateToken } from "@/util/auth";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const createOrg = createServerAction(
  async ({ name }: { name: string }) => {
    const session = await getServerSession(authOptions);
    console.log(session);
    if (!session) {
      throw new SessionNotFoundError();
    }

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
        role: "ADMIN",
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
