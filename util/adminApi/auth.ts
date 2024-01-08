import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";
import prisma from "../../lib/services/db";
import { Logger } from "../logger";
import { decodeToken } from "./tokenDecoding";

export async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse,
  type: string
) {
  const logger = new Logger(__filename);

  // Retrieve provided authorization token
  let authToken = req.headers.authorization;

  // Validate provided token
  if (!authToken) {
    // Token is missing, return 401 Unauthorized
    logger.error("Authorization token is missing");
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authorization token is required" });
  }

  // Check for "Bearer " prefix
  if (authToken.startsWith("Bearer ")) {
    // Remove the "Bearer " prefix
    authToken = authToken.substring("Bearer ".length);
  }

  const ip = requestIp.getClientIp(req);

  // Only rate limit when an ip has been provided
  if (ip) {
    let countingStartDate = new Date();
    // Subtract one day
    countingStartDate = new Date(
      countingStartDate.getTime() - 24 * 60 * 60 * 1000
    );

    // Count requests for ip (for rate limiting)
    const requestCount = await prisma.loggedAdminApiRequests.count({
      where: {
        ip: ip,
        success: false,
        createdAt: {
          gte: countingStartDate,
        },
      },
    });

    // Limit requests for ips with at least 5 failed requests
    // within the last 24 hours
    if (requestCount >= 5) {
      logger.error(
        `Ip(=${ip}) had ${requestCount} failed requests within the last 24 hours and will thus not be processed.`
      );
      return res
        .status(StatusCodes.TOO_MANY_REQUESTS)
        .json({ message: "Too many failed requests" });
    }
  } else {
    logger.error("No ip has been provided");
  }

  const tokenInfo = decodeToken(authToken);

  if (!tokenInfo) {
    // Log failed request
    await logAdminApiRequest(authToken, false, ip);

    // Token has wrong format, return 403 Forbidden
    logger.error("Authorization token is invalid");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Authorization token is invalid" });
  } else {
    if (tokenInfo.type !== type) {
      logger.error("Authorization token is used for wrong route");
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Access denied. Wrong route." });
    }
  }

  let tokenFromDb;

  if (tokenInfo.type === "org") {
    tokenFromDb = await prisma.organisationAdminToken.findFirst({
      where: {
        token: authToken,
        isDeleted: false,
      },
    });
  } else if (tokenInfo.type === "app") {
    tokenFromDb = await prisma.appAdminToken.findFirst({
      where: {
        token: authToken,
        isDeleted: false,
        OR: [
          {
            expiryDate: null,
          },
          {
            expiryDate: {
              gt: new Date(),
            },
          },
        ],
      },
    });
  }

  logAdminApiRequest(authToken, !!tokenFromDb, ip);

  if (tokenFromDb) {
    logger.log(`Successfully validated token(=${authToken})`);
  } else {
    logger.error(`Failed to validate token(=${authToken})`);
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Authorization token is invalid" });
  }

  // Return the validated token
  return authToken;
}

async function logAdminApiRequest(
  token: string,
  success: boolean,
  ip: string | null
): Promise<void> {
  if (!ip) {
    return;
  }

  try {
    await prisma.loggedAdminApiRequests.create({
      data: {
        token: token,
        success: success,
        ip: ip,
      },
    });
  } catch (error) {
    console.error("Error logging admin API request:", error);
  }
}
