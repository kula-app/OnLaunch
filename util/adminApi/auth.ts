import { StatusCodes } from "http-status-codes";
import type { NextApiRequest } from "next";
import prisma from "../../lib/services/db";
import { Logger } from "../logger";
import { decodeToken } from "./tokenDecoding";

interface AuthResult {
  success: boolean;
  authToken?: string;
  id?: number;
  statusCode: number;
  errorMessage?: string;
}

export async function authenticate(
  req: NextApiRequest,
  type: string
): Promise<AuthResult> {
  const logger = new Logger(__filename);

  // Retrieve provided authorization token
  let authToken = req.headers.authorization;

  // Validate provided token
  if (!authToken) {
    // Token is missing, return 401 Unauthorized
    logger.error("Authorization token is missing");
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
  }

  const tokenInfo = decodeToken(authToken);

  if (!tokenInfo) {
    // Token has wrong format, return 403 Forbidden
    logger.error("Authorization token is invalid");
    return {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Authorization token is invalid",
    };
  }

  if (tokenInfo.type !== type) {
    logger.error("Authorization token is used for wrong route");
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
    return {
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      errorMessage: "Authorization token is invalid",
    };
  }

  logger.log(`Successfully validated token(=${authToken})`);
  // Return the validated token
  return {
    success: true,
    authToken: tokenInfo.token,
    id,
    statusCode: StatusCodes.OK,
  };
}
