import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { CreateAppDto } from "../../../../../../models/dtos/request/createAppDto";
import { AppDto } from "../../../../../../models/dtos/response/appDto";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { generateToken } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

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

  switch (req.method) {
    // Create new app
    case "POST":
      const createAppDto = plainToInstance(CreateAppDto, req.body);
      const validationErrors = await validate(createAppDto);

      if (validationErrors.length > 0) {
        const errors = validationErrors
          .flatMap((error) =>
            error.constraints
              ? Object.values(error.constraints)
              : ["An unknown error occurred"]
          )
          .join(", ");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `Validation failed: ${errors}` });
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

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
