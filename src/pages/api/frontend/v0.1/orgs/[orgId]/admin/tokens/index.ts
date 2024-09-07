import { OrgAdminTokenDto } from "@/models/dtos/response/orgAdminTokenDto";
import { User } from "@/models/user";
import prisma from "@/services/db";
import { encodeOrgToken } from "@/util/adminApi/tokenEncoding";
import { generateToken } from "@/util/auth";
import { authenticatedHandler } from "@/util/authenticatedHandler";
import { Logger } from "@/util/logger";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  return authenticatedHandler(
    req,
    res,
    { method: "withRole" },
    async (req, res, user) => {
      if (user.role !== "ADMIN") {
        logger.error("User has no admin rights");
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not an admin" });
      }

      switch (req.method) {
        case "GET":
          return getHandler(req, res, user);

        case "POST":
          return postHandler(req, res, user);

        default:
          return res
            .status(StatusCodes.METHOD_NOT_ALLOWED)
            .json({ message: "Method not allowed" });
      }
    },
  );
}

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  const orgId = Number(req.query.orgId);

  logger.log(`Looking up orgAdminTokens for org with id(=${orgId})`);
  const orgAdminTokens = await prisma.organisationAdminToken.findMany({
    where: {
      orgId: orgId,
      isDeleted: false,
    },
  });

  return res.status(StatusCodes.OK).json(
    orgAdminTokens.map((orgAdminToken): OrgAdminTokenDto => {
      return {
        id: orgAdminToken.id,
        createdAt: orgAdminToken.createdAt,
        updatedAt: orgAdminToken.updatedAt,
        token: encodeOrgToken(orgAdminToken.token),
        role: orgAdminToken.role,
        label: orgAdminToken.label ? orgAdminToken.label : "",
      };
    }),
  );
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
) {
  const orgId = Number(req.query.orgId);

  const label = req.body.label;

  const generatedToken = generateToken();

  logger.log(`Creating new organisation admin token for org id '${orgId}'`);
  const orgAdminToken = await prisma.organisationAdminToken.create({
    data: {
      token: generatedToken,
      orgId: orgId,
      label: label,
    },
  });

  const dto: OrgAdminTokenDto = {
    id: orgAdminToken.id,
    createdAt: orgAdminToken.createdAt,
    updatedAt: orgAdminToken.updatedAt,
    token: encodeOrgToken(orgAdminToken.token),
    label: orgAdminToken.label,
    role: orgAdminToken.role,
  };

  return res.status(StatusCodes.CREATED).json(dto);
}
