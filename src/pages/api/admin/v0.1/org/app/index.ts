import { AuthResult } from '@/models/authResult';
import { ErrorDto, getErrorDto } from '@/models/dtos/error';
import { CreateAppDto } from '@/models/dtos/request/createAppDto';
import { AppDto } from '@/models/dtos/response/appDto';
import prisma from '@/services/db';
import { authenticate } from '@/util/adminApi/auth';
import { generateToken } from '@/util/auth';
import { Logger } from '@/util/logger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';

const logger = new Logger(__filename);

/**
 * @swagger
 * tags:
 *   - name: Admin API
 *     description: Operations related to the management in the Admin API
 *
 * /api/admin/v0.1/org/app:
 *   post:
 *     tags:
 *       - Admin API
 *     summary: Create new app
 *     description: Creates a new app for the authenticated organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppDto'
 *     responses:
 *       201:
 *         description: New app created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppDto'
 *       400:
 *         description: Validation failed or invalid request.
 *       401:
 *         description: Authentication failed, invalid or missing credentials.
 *       405:
 *         description: Method not allowed, only POST method is supported for this endpoint.
 *
 * components:
 *   schemas:
 *     CreateAppDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the app to be created.
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
  res: NextApiResponse<AppDto | ErrorDto>,
) {
  const authResult = await authenticate(req, 'org');

  // When authResult was not successful, return error with respective
  // code and message
  if (!authResult.success)
    return res
      .status(authResult.statusCode)
      .json(getErrorDto(authResult.errorMessage));

  switch (req.method) {
    // Create new app
    case 'POST':
      return postHandler(req, res, authResult);
    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json(getErrorDto('method not allowed'));
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  authResult: AuthResult,
) {
  const createAppDto = plainToInstance(CreateAppDto, req.body);
  const validationErrors = await validate(createAppDto);

  if (validationErrors.length > 0) {
    const errors = validationErrors
      .flatMap((error) =>
        error.constraints
          ? Object.values(error.constraints)
          : ['An unknown error occurred'],
      )
      .join(', ');
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(getErrorDto(`Validation failed: ${errors}`));
  }

  const name = createAppDto.name;

  logger.log(`Creating app with name(='${name}'`);

  const generatedToken = generateToken();

  const newApp = await prisma.app.create({
    data: {
      name: name,
      orgId: authResult.id,
      publicKey: generatedToken,
    },
  });

  const dto: AppDto = {
    id: newApp.id,
    createdAt: newApp.createdAt,
    updatedAt: newApp.updatedAt,
    name: newApp.name,
    publicKey: newApp.publicKey,
  };

  return res.status(StatusCodes.CREATED).json(dto);
}
