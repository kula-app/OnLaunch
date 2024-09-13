"use server";

import { NotFoundError } from "@/errors/not-found-error";
import { SessionNotFoundError } from "@/errors/session-not-found-error";
import { UserAlreadyJoinedOrgError } from "@/errors/user-already-joined-org-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const joinOrgWithInvite = createServerAction(
  async (token: string): Promise<Pick<Org, "id">> => {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new SessionNotFoundError();
    }

    logger.log(`Fetching organization with token '${token}'`);
    const org = await prisma.organisation.findFirst({
      where: {
        invitationToken: token as string,
        isDeleted: false,
      },
    });
    if (!org) {
      throw new NotFoundError("Organisation not found");
    }

    logger.log(
      `Creating relation between user ${session.user.id} and org ${org.id}`,
    );
    try {
      await prisma.usersInOrganisations.create({
        data: {
          userId: session.user.id,
          orgId: org.id,
          role: "USER",
        },
      });
    } catch (e: any) {
      // Catch unique constraints
      if (e.code === "P2002") {
        logger.warn(`User ${session.user.id} already joined org ${org.id}`);
        throw new UserAlreadyJoinedOrgError(org.id);
      }
    }
    logger.log(`User ${session.user.id} joined org ${org.id}`);

    return {
      id: org.id,
    };
  },
);
