import { StatusCodes } from "http-status-codes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "./lib/services/db";
import { decodeToken } from "./util/adminApi/tokenDecoding";
import { Logger } from "./util/logger";

export async function middleware(req: NextRequest) {
  const logger = new Logger("Middleware");

  logger.log(`Middleware called for path: ${req.nextUrl}`);

  // Retrieve provided token
  let authToken = req.headers.get("authorization");

  // Validate provided token
  if (!authToken) {
    // Token is missing, return 401 Unauthorized
    logger.error("Authorization token is missing");
    return new NextResponse("Authorization token is required", {
      status: StatusCodes.UNAUTHORIZED,
    });
  }

  // Check for "Bearer " prefix
  if (authToken.startsWith("Bearer ")) {
    // Remove the "Bearer " prefix
    authToken = authToken.substring("Bearer ".length);
  }

  const ip = req.ip;

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
      return new NextResponse("Too many failed requests", {
        status: StatusCodes.TOO_MANY_REQUESTS,
        // Indicate that the client should wait for one day
        headers: { "Retry-After": `${60 * 60 * 24}` },
      });
    }
  } else {
    logger.error("No ip has been provided");
  }

  const tokenInfo = decodeToken(authToken);

  if (
    !tokenInfo ||
    !tokenInfo.accessToken ||
    !tokenInfo.id ||
    !tokenInfo.type
  ) {
    // Log failed request
    await logAdminApiRequest(authToken, false, ip);

    // Token has wrong format, return 403 Forbidden
    logger.error("Authorization token is invalid");
    return new NextResponse("Authorization token is invalid", {
      status: StatusCodes.FORBIDDEN,
    });
  }
  let tokenFromDb;
  if (tokenInfo.type === "org") {
    tokenFromDb = await prisma.organisationAdminToken.findFirst({
      where: {
        token: authToken,
        isRevoked: false,
      },
    });
  } else if (tokenInfo.type === "app") {
    tokenFromDb = await prisma.appAdminToken.findFirst({
      where: {
        token: authToken,
        isRevoked: false,
        expiryDate: {
          gt: new Date(),
        },
      },
    });
  }

  logAdminApiRequest(authToken, !!tokenFromDb, ip);

  if (tokenFromDb) {
    logger.log(`Successfully validated token(=${authToken})`);
  } else {
    logger.error(`Failed to validate token(=${authToken})`);
    return new NextResponse("Authorization token is invalid", {
      status: StatusCodes.FORBIDDEN,
    });
  }

  // If valid, just go to the intended admin api page
  return NextResponse.next();
}

async function logAdminApiRequest(
  token: string,
  success: boolean,
  ip: string | undefined
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

// Matches all sub-paths of /api/adminApi/...
export const config = {
  matcher: ["/api/admin/:path*"],
};
