import { StatusCodes } from "http-status-codes";
import type { NextApiRequest } from "next";
import requestIp from "request-ip";
import { loadConfig } from "../../config/loadConfig";
import prisma from "../../lib/services/db";
import { AuthResult } from "../../models/authResult";
import { Logger } from "../logger";
import { decodeToken } from "./tokenDecoding";

export async function authenticate(
  req: NextApiRequest,
  type: string
): Promise<AuthResult> {
  const logger = new Logger(__filename);
  const adminApiConfig = loadConfig().server.adminApi;

  const ip = requestIp.getClientIp(req);

  // Retrieve provided authorization token
  let authToken = req.headers.authorization;

  // Validate provided token
  if (!authToken) {
    // Token is missing, return 401 Unauthorized
    logger.error("Authorization token is missing");

    if (ip) {
      await logAdminApiRequest("", false, ip);
    }

    return {
      success: false,
      statusCode: StatusCodes.UNAUTHORIZED,
      errorMessage: "Authorization token is required",
    };
  }

  // Check for "Bearer " prefix
  const bearerPrefix = "Bearer ";
  if (authToken.startsWith(bearerPrefix)) {
    // Remove the "Bearer " prefix
    authToken = authToken.substring(bearerPrefix.length);
  } else {
    logger.error(
      'Authorization token is invalid - missing the "Bearer " prefix'
    );

    if (ip) {
      await logAdminApiRequest(authToken, false, ip);
    }

    return {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage:
        'Authorization token is invalid - missing the "Bearer " prefix',
    };
  }

  // Only rate limit when an ip has been provided
  if (ip) {
    let countingStartDate = new Date();
    // Subtract one hour
    countingStartDate = new Date(countingStartDate.getTime() - 60 * 60 * 1000);

    // Count requests for ip (for rate limiting)
    const requestCount = await prisma.loggedAdminApiRequests.count({
      where: {
        ip: ip,
        createdAt: {
          gte: countingStartDate,
        },
      },
    });

    // Limit requests for ips within the last hour
    if (requestCount >= adminApiConfig.requestLimit) {
      logger.error(
        `Ip(=${ip}) had ${requestCount} requests within the last hour and will thus not be processed.`
      );

      if (ip) {
        await logAdminApiRequest(authToken, false, ip);
      }

      return {
        success: false,
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        errorMessage: "Too many requests",
      };
    }
  } else {
    logger.error("No ip has been provided");
  }

  const tokenInfo = decodeToken(authToken);

  if (!tokenInfo) {
    // Token has wrong format, return 403 Forbidden
    logger.error("Authorization token is invalid");

    if (ip) {
      await logAdminApiRequest(authToken, false, ip);
    }

    return {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Authorization token is invalid",
    };
  }

  if (tokenInfo.type !== type) {
    logger.error("Authorization token is used for wrong route");

    if (ip) {
      await logAdminApiRequest(authToken, false, ip);
    }

    return {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Access denied. Wrong route.",
    };
  }

  let tokenFromDb;
  let id;

  if (tokenInfo.type === "org") {
    tokenFromDb = await prisma.organisationAdminToken.findFirst({
      where: {
        token: tokenInfo.token,
        isDeleted: false,
      },
    });
    id = tokenFromDb?.orgId;
  } else if (tokenInfo.type === "app") {
    tokenFromDb = await prisma.appAdminToken.findFirst({
      where: {
        token: tokenInfo.token,
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
    id = tokenFromDb?.appId;
  }

  if (!tokenFromDb) {
    logger.error(`Failed to validate token(=${authToken})`);

    if (ip) {
      await logAdminApiRequest(authToken, false, ip);
    }

    return {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Authorization token is invalid",
    };
  }

  await logAdminApiRequest(authToken, !!tokenFromDb, ip);

  logger.log(`Successfully validated token(=${authToken})`);
  // Return the validated token
  return {
    success: true,
    authToken: tokenInfo.token,
    id,
    statusCode: StatusCodes.OK,
  };
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
