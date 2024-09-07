import { User } from "@/models/user";
import prisma from "@/services/db";
import { authenticatedHandler } from "@/util/authenticatedHandler";
import { Logger } from "@/util/logger";
import { Prisma } from "@prisma/client";
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
      const orgId = Number(req.query.orgId);

      switch (req.method) {
        case "GET":
          return getHandler(req, res, user, orgId);

        case "DELETE":
          return deleteHandler(req, res, user, orgId);

        case "PUT":
          return putHandler(req, res, user, orgId);

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
  orgId: number,
) {
  logger.log(`Looking up organisation with id '${orgId}'`);
  const org = await prisma.organisation.findUnique({
    where: {
      id: orgId,
      isDeleted: false,
    },
    include: {
      apps: true,
    },
  });

  if (org == null) {
    logger.error(`No organisation found with id '${orgId}'`);
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `No organisation found with id '${orgId}'`,
    });
  }

  return res.status(StatusCodes.OK).json({
    name: org.name,
    apps: org.apps,
    role: user.role,
    customer: org.stripeCustomerId,
    invitationToken: user.role === "ADMIN" ? org.invitationToken : "",
  });
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
  orgId: number,
) {
  try {
    if (user.role === "USER") {
      logger.error(
        `You are not allowed to delete organisation with id '${orgId}'`,
      );
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not allowed to delete organisation with id " + orgId,
      });
    }

    const orgToDelete = await prisma.organisation.findUnique({
      include: {
        subs: {
          where: {
            isDeleted: false,
          },
        },
      },
      where: {
        id: orgId,
      },
    });

    if (orgToDelete && orgToDelete.isDeleted) {
      logger.error("Organisation has already been deleted");
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Organisation with id '${orgId}' not found`,
      });
    }

    if (orgToDelete && orgToDelete.subs.length > 0) {
      logger.error(
        "Cannot delete organisation with active subscription! Cancel subscription first",
      );
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "Cannot delete organisation with active subscription! Cancel subscription first",
      });
    }

    logger.log(
      `Setting the isDeleted flag for all active orgAdminTokens for org with id(=${orgId})`,
    );
    await prisma.organisationAdminToken.updateMany({
      where: {
        orgId: orgId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    logger.log(`Deleting organisation with id '${orgId}'`);
    const deletedOrg = await prisma.organisation.update({
      where: {
        id: orgId,
      },
      data: {
        isDeleted: true,
      },
    });

    logger.log(`Successfully deleted org with id '${orgId}'`);
    return res.status(StatusCodes.OK).json(deletedOrg);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Error while deleting org with id '${orgId}': ${e}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Error while deleting org!",
      });
    }
    return res
      .status(StatusCodes.NOT_IMPLEMENTED)
      .json({ message: "Not implemented: unhandled response path" });
  }
}

async function putHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  user: User,
  orgId: number,
) {
  try {
    if (user.role === "USER") {
      logger.error(
        `You are not allowed to update organisation with id '${orgId}'`,
      );
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not allowed to update organisation with id " + orgId,
      });
    }

    const newName = req.body.name;

    if (!newName) {
      return res.status(StatusCodes.NO_CONTENT).json({
        message: `No content provided to update organisation with id '${orgId}'`,
      });
    }

    logger.log(`Updating org with id '${orgId}'`);
    const updatedOrg = await prisma.organisation.update({
      where: {
        id: orgId,
        isDeleted: false,
      },
      data: {
        name: newName,
      },
    });

    return res.status(StatusCodes.OK).json(updatedOrg);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`No organisation found with id '${orgId}'`);
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "No organisation found with id " + orgId,
      });
    }
    return res
      .status(StatusCodes.NOT_IMPLEMENTED)
      .json({ message: "Not implemented: unhandled response path" });
  }
}
