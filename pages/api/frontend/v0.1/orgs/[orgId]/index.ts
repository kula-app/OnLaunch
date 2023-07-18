import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getUserWithRoleFromRequest } from "../../../../../../util/auth";
import { Logger } from "../../../../../../util/logger";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserWithRoleFromRequest(req, res, prisma);

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
      logger.log(`Looking up organisation with id '${req.query.orgId}'`);
      const org = await prisma.organisation.findUnique({
        where: {
          id: Number(req.query.orgId),
        },
        include: {
          apps: true,
        },
      });

      if (org == null) {
        logger.error(`No organisation found with id '${req.query.orgId}'`);
        res.status(StatusCodes.NOT_FOUND).json({
          message: "no organisation found with id " + req.query.orgId,
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        name: org.name,
        apps: org.apps,
        role: user.role,
        invitationToken: user.role === "ADMIN" ? org.invitationToken : "",
      });
      break;

    case "DELETE":
      try {
        if (user.role === "USER") {
          logger.error(
            `You are not allowed to delete organisation with id '${req.query.orgId}'`
          );
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "You are not allowed to delete organisation with id " +
              req.query.orgId,
          });
          return;
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
            id: Number(req.query.orgId),
          },
        });

        if (orgToDelete && orgToDelete.subs.length > 0) {
          logger.error(
            "Cannot delete organisation with active subscription! Cancel subscription first"
          );
          res.status(StatusCodes.BAD_REQUEST).json({
            message:
              "Cannot delete organisation with active subscription! Cancel subscription first",
          });
          return;
        }

        logger.log(
          `Deleting user relations from organisation with id '${req.query.orgId}'`
        );
        // remove relationships between the to-be-deleted organisation and its users
        await prisma.usersInOrganisations.deleteMany({
          where: {
            orgId: Number(req.query.orgId),
          },
        });

        logger.log(`Deleting organisation with id '${req.query.orgId}'`);
        const deletedOrg = await prisma.organisation.delete({
          where: {
            id: Number(req.query.orgId),
          },
        });

        res.status(StatusCodes.OK).json(deletedOrg);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(`No organisation found with id '${req.query.orgId}'`);
          res.status(StatusCodes.NOT_FOUND).json({
            message: "No organisation found with id " + req.query.orgId,
          });
          return;
        }
      }
      break;

    case "PUT":
      try {
        if (user.role === "USER") {
          logger.error(
            `You are not allowed to update organisation with id '${req.query.orgId}'`
          );
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "You are not allowed to update organisation with id " +
              req.query.orgId,
          });
        }

        logger.log(`Updating org with id '${req.query.orgId}'`);
        const updatedOrg = await prisma.organisation.update({
          where: {
            id: Number(req.query.orgId),
          },
          data: {
            name: req.body.name,
          },
        });

        res.status(StatusCodes.CREATED).json(updatedOrg);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(`No organisation found with id '${req.query.orgId}'`);
          res.status(StatusCodes.NOT_FOUND).json({
            message: "No organisation found with id " + req.query.orgId,
          });
        }
      }
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
