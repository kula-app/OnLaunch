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
        const orgId: number = Number(req.query.orgId);
        const appId = !!req.query.appId ? Number(req.query.appId) : undefined;

        logger.log(`Retrieving dashboard data for org with id '${orgId}'`);

        // Since prisma does not support direct date aggregation, the
        // grouping by the day is done via queryRaw, which uses
        // prisma's "tagged template" that should be reducing the risk
        // of SQL injections
        // Get the count of loggedApiRequests grouped by day for the last 31 days
        let result: QueryResult;
        if (appId != undefined) {
          result = await prisma.$queryRaw`
          WITH date_series AS (
            SELECT generate_series(CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE, INTERVAL '1 day')::DATE AS date
          )
          SELECT ds.date, COALESCE(count(lar."createdAt"), 0) AS count
          FROM date_series ds
          LEFT JOIN "LoggedApiRequests" lar ON DATE(lar."createdAt") = ds.date AND lar."appId" IN (
            SELECT "id" FROM "App" WHERE "orgId" = ${orgId}::integer AND "appId" = ${appId}::integer
          )
          GROUP BY ds.date
          ORDER BY ds.date DESC;
        `;
        } else {
          result = await prisma.$queryRaw`
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
        }

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