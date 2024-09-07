import { loadServerConfig } from "@/config/loadServerConfig";
import prisma from "@/services/db";
import redis from "@/services/redis";
import { Logger } from "@/util/logger";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import * as os from "os";

const logger = new Logger(__filename);

type Data = {
  status: string;
  hostname: string;
  uptime: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | {}>,
) {
  const config = loadServerConfig();
  if (req.headers.authorization !== `token ${config.health.apiKey}`) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: {
        message: "Invalid API Key",
      },
    });
  }
  const result = await fetchHealthcheck();
  res
    .status(
      result.status == "error"
        ? StatusCodes.SERVICE_UNAVAILABLE
        : StatusCodes.OK,
    )
    .setHeader("Content-Type", "application/health+json")
    .json(result);
}

interface HealthCheckResult {
  /**
   * Indicates whether the service status is acceptable or not.
   *
   *  - "ok": healthy
   *  - "error": unhealthy
   *  - "warn": healthy, with some concerns.
   */
  status: "ok" | "error" | "warn";
  /**
   * An object that provides detailed health statuses of additional downstream systems and endpoints which can affect the
   * overall health of the main API.
   */
  checks: {
    [keyof: string]: {
      status: "ok" | "error" | "warn";
      componentType?: string;
      observedValue?: any;
      observedUnit?: string;
      time: string;
    }[];
  };
}

/**
 * Response schema according as of this draft:
 *
 * https://github.com/inadarei/rfc-healthcheck/blob/master/draft-inadarei-api-health-check-06.txt
 */
async function fetchHealthcheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();

  // Create the base result
  let checks: HealthCheckResult["checks"] = {
    uptime: [
      {
        componentType: "system",
        observedValue: os.uptime(),
        observedUnit: "s",
        status: "ok",
        time: timestamp,
      },
    ],
  };
  try {
    // Check the database connection
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    checks["postgres:connected"] = [
      {
        status: "ok",
        componentType: "datastore",
        time: timestamp,
      },
    ];
  } catch (error) {
    logger.error(`Failed to connect to database: ${error}`);
    checks["postgres:connected"] = [
      {
        status: "error",
        componentType: "datastore",
        time: timestamp,
      },
    ];
  }
  try {
    // Check the redis connection
    if (redis.isEnabled) {
      await redis.client.ping();
      checks["redis:connected"] = [
        {
          status: "ok",
          componentType: "datastore",
          time: timestamp,
        },
      ];
    }
  } catch (error) {
    logger.error(`Failed to connect to redis: ${error}`);
    checks["redis:connected"] = [
      {
        status: "error",
        componentType: "datastore",
        time: timestamp,
      },
    ];
  }
  return {
    status: Object.values(checks)
      .reduce((previousValue, checks) => previousValue.concat(checks), [])
      .reduce<"ok" | "warn" | "error">((previousValue, check) => {
        // If an error was already encountered, stick with it
        if (previousValue === "error") {
          return previousValue;
        }
        // If an error is found, return it
        if (check.status === "error") {
          return check.status;
        }
        // If a warning was already encountered, stick with it
        if (previousValue === "warn") {
          return previousValue;
        }
        // If a warning is found, return it
        if (check.status === "warn") {
          return check.status;
        }
        return "ok";
      }, "ok"),
    checks: checks,
  };
}
