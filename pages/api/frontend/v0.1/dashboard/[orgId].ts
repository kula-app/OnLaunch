import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import { getUserWithRoleFromRequest } from "../../../../../util/auth";

const prisma: PrismaClient = new PrismaClient();

type QueryResult = {
  date: string;
  count: number | bigint;
}[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
    return;
  } else if (user.role !== "ADMIN") {
    logger.log(`User with id '${user.id}' tried to access dashboard data without sufficient rights`);
    return;
  }

  switch (req.method) {
    case "GET":
      try {
        const orgId = Number(req.query.orgId);

        logger.log(`Retrieving dashboard data for org with id '${orgId}'`);
        // Since prisma does not support direct date aggregation, the
        // grouping by the day is done via executeRaw, which uses
        // prisma's "tagged template" that should be reducing the risk
        // of SQL injections
        // Get the count of loggedApiRequests groubed by day for the last 31 days
        const result = (await prisma.$queryRaw` 
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
        `) as QueryResult;

        const serializedResult = result.map((entry) => ({
          ...entry,
          count:
            typeof entry.count === "bigint"
              ? entry.count.toString()
              : entry.count,
        }));

        let jsonResponse: any = {
          dailyCounts: serializedResult,
        };

        // Check if there is an active subscription for the organisation
        // to retrieve billing period data
        const org = await prisma.organisation.findFirst({
          where: {
            id: orgId,
          },
          include: {
            subs: {
              where: {
                isDeleted: false,
              },
            },
          },
        });

        // If there is an active sub, find additional data to split
        // views in the dashboard
        if (org && org.subs && org?.subs.length > 0) {
          const billingStartDate = org.subs[0].currentPeriodStart;

          logger.log(`Finding requests of billing start day for org with id '${orgId}'`);
          // This query returns the count of requests for the day
          // of the start of the billing period. Earlier requests
          // on that day are not counted
          const countAfterBillingStart = (await prisma.$queryRaw`
            SELECT COUNT(*)
            FROM "LoggedApiRequests" lar
            WHERE DATE(lar."createdAt") = ${billingStartDate}::date
            AND lar."createdAt" > ${billingStartDate}
            AND lar."appId" IN (
                SELECT "id" FROM "App" WHERE "orgId" = ${orgId}::integer
            );
          `) as { count: number | bigint }[];

          // Convert countAfterBillingStart's count value to a string if it's a BigInt
          jsonResponse.billingDay = {
            date: billingStartDate,
            countAfterBillingStart:
              typeof countAfterBillingStart[0].count === "bigint"
                ? countAfterBillingStart[0].count.toString()
                : countAfterBillingStart[0].count,
          };
        }

        res.status(StatusCodes.OK).end(JSON.stringify(jsonResponse));
      } catch (error) {
        logger.error(`Error: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).end(error);
      }
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
