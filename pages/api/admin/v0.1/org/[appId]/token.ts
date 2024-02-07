import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { AppAdminTokenDto } from "../../../../../../models/dtos/response/appAdminTokenDto";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { encodeAppToken } from "../../../../../../util/adminApi/tokenEncoding";
import { generateToken } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

/**
 * @swagger
 * tags:
 *   - name: Admin API
 *     description: Operations related to the management in the Admin API
 *
 * /api/admin/v0.1/org/[appId]/token:
 *   post:
 *     tags:
 *       - Admin API
 *     summary: Create temporary AppAdminToken for app
 *     description: Creates a temporary AppAdminToken for the specified app belonging to the authenticated organization.
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         description: The ID of the app for which to create the token.
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Temporary AppAdminToken created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppAdminTokenDto'
 *       400:
 *         description: No app ID provided or invalid request.
 *       401:
 *         description: Authentication failed, invalid or missing credentials.
 *       404:
 *         description: No app found for the provided ID belonging to the authenticated organization.
 *       405:
 *         description: Method not allowed, only POST method is supported for this endpoint.
 *
 * components:
 *   schemas:
 *     AppAdminTokenDto:
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
 *         token:
 *           type: string
 *         role:
 *           type: string
 *           enum: [TEMP, FULL]
 *         label:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date-time
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const authResult = await authenticate(req, "org");

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json({ message: authResult.errorMessage });

  const appId = Number(req.query.appId);

  if (!appId) {
    logger.error(`No app id provided!`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `No app id provided!`,
    });
  }

  switch (req.method) {
    // Create new magic AppAdminToken for app
    case "POST":
      // Check whether the app is part of the organisation
      const appFromDb = await prisma.app.findFirst({
        where: {
          id: appId,
          orgId: authResult.id,
        },
      });

      if (!appFromDb) {
        logger.error(
          `No app with id(=${appId}) found for org with id(=${authResult.id}!`
        );
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No app with id(=${appId}) found for org with id(=${authResult.id}!`,
        });
      }

      logger.log(
        `Creating temporary AppAdminToken for app with id(='${appId}')`
      );

      const generatedToken = generateToken();

      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 5);

      const appAdminToken = await prisma.appAdminToken.create({
        data: {
          token: generatedToken,
          role: "TEMP",
          expiryDate: expiryDate,
          appId: appId,
        },
      });

      const dto: AppAdminTokenDto = {
        id: appAdminToken.id,
        createdAt: appAdminToken.createdAt,
        updatedAt: appAdminToken.updatedAt,
        token: encodeAppToken(appAdminToken.token),
        role: appAdminToken.role,
        ...(appAdminToken.label && { label: appAdminToken.label }),
        expiryDate: expiryDate,
      };

      return res.status(StatusCodes.CREATED).json(dto);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
