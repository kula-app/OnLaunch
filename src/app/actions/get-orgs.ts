"use server";

import { SessionNotFoundError } from "@/errors/session-not-found-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const getOrgs = createServerAction(async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new SessionNotFoundError();
  }

  logger.verbose(
    `Fetching organisations for user with id '${session.user.id}'`,
  );
  const orgs = await prisma.usersInOrganisations.findMany({
    where: {
      user: {
        id: session.user.id,
        isDeleted: false,
      },
      org: {
        isDeleted: false,
      },
    },
    include: {
      org: {
        include: {
          subs: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
  });

  return orgs.map(
    (org): Org => ({
      id: org.org.id,
      name: org.org.name,
      role: org.role,
      subName: org.org.subs[0]?.subName ?? "free",
    }),
  );
});
