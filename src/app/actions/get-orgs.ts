"use server";

import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { createAuthenticatedServerAction } from "@/util/create-authenticated-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(__filename);

export const getOrgs = createAuthenticatedServerAction(async (session) => {
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
    orderBy: {
      org: {
        name: "asc",
      },
    },
  });

  return orgs.map(
    (org): Org => ({
      id: org.org.id,
      name: org.org.name,
      subName: org.org.subs[0]?.subName ?? "free",
    }),
  );
});
