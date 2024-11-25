"use server";

import { ForbiddenError } from "@/errors/forbidden-error";
import { SessionNotFoundError } from "@/errors/session-not-found-error";
import { UnauthorizedError } from "@/errors/unauthorized-error";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import type { RequestHistory } from "@/models/request-history";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const getRequestHistoryOfOrg = createServerAction(
  async ({ orgId }: { orgId: Org["id"] }): Promise<RequestHistory> => {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new SessionNotFoundError();
    }

    logger.verbose(
      `Fetching request history of organization with id '${orgId}' for user with id '${session.user.id}'`,
    );
    const userInOrg = await prisma.usersInOrganisations.findFirst({
      where: {
        userId: session.user.id,
        orgId: orgId,
      },
      select: {
        role: true,
      },
    });
    if (!userInOrg) {
      throw new UnauthorizedError(
        "User does not have access to the organization",
      );
    }
    if (userInOrg.role !== OrgRole.ADMIN) {
      throw new ForbiddenError(
        "User does not have necessary rights to fetch request history data",
      );
    }

    // Since prisma does not support direct date aggregation, the
    // grouping by the day is done via queryRaw, which uses
    // prisma's "tagged template" that should be reducing the risk
    // of SQL injections
    // Get the count of loggedApiRequests grouped by day for the last 31 days
    const result: {
      date: string;
      count: number | bigint;
    }[] = await prisma.$queryRaw`
      WITH date_series AS (
        SELECT generate_series(CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE, INTERVAL '1 day')::DATE AS date
      )
      SELECT ds.date, COALESCE(count(lar."createdAt"), 0) AS count
      FROM date_series ds
      LEFT JOIN "LoggedApiRequests" lar ON DATE(lar."createdAt") = ds.date AND lar."appId" IN (
        SELECT "id" FROM "App" WHERE "orgId" = ${orgId}::integer
      )
      GROUP BY ds.date
      ORDER BY ds.date DESC;
    `;

    return {
      items: result.map((entry) => ({
        date: new Date(entry.date),
        count: BigInt(entry.count),
      })),
    };
  },
);
