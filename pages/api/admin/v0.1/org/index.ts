import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { AuthResult } from "../../../../../models/authResult";
import { AppDto } from "../../../../../models/dtos/response/appDto";
import { OrgDto } from "../../../../../models/dtos/response/orgDto";
import { authenticate } from "../../../../../util/adminApi/auth";
import { Logger } from "../../../../../util/logger";

const logger = new Logger(__filename);

/**
 * @swagger
 * tags:
 *   - name: Admin API
 *     description: Operations related to the management in the Admin API
 *
 * /api/admin/v0.1/org:
 *   get:
 *     tags:
 *       - Admin API
 *     summary: Get organisation details
 *     description: Retrieves details of the authenticated organisation, including its apps.
 *     responses:
 *       200:
 *         description: Organisation details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrgDto'
 *       401:
 *         description: Authentication failed, invalid or missing credentials.
 *       404:
 *         description: Organisation not found with the provided ID.
 *       405:
 *         description: Method not allowed, only GET method is supported for this endpoint.
 *
 * components:
 *   schemas:
 *     OrgDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         name:
 *           type: string
 *         apps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppDto'
 *     AppDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         name:
 *           type: string
 *         publicKey:
 *           type: string
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrgDto | ErrorDto>
) {
  const authResult = await authenticate(req, "org");

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json(getErrorDto(authResult.errorMessage));

  switch (req.method) {
    // Find org (including apps) by token
    // If found, return org data with apps
    case "GET":
      return getHandler(req, res, authResult);
    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json(getErrorDto("method not allowed"));
  }
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult
) {
  logger.log(`Looking up organisation with id(='${authResult.id}')`);

  const org = await prisma.organisation.findUnique({
    where: {
      id: authResult.id,
      isDeleted: false,
    },
    include: {
      apps: true,
    },
  });

  if (org == null) {
    logger.error(`No organisation found with id '${authResult.id}'`);
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(getErrorDto(`No organisation found with id '${authResult.id}'`));
  }

  const convertedApps: AppDto[] = org.apps.map(
    (app): AppDto => ({
      id: app.id,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      name: app.name,
      publicKey: app.publicKey,
    })
  );
  const dto: OrgDto = {
    id: org.id,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    name: org.name,
    apps: convertedApps,
  };

  return res.status(StatusCodes.OK).json(dto);
}
