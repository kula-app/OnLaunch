import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized!" });
    return;
  }

  const id = session.user?.id;

  const userInOrg = await prisma.usersInOrganisations.findFirst({
    where: {
      user: {
        id: Number(id),
      },
      org: {
        id: Number(req.query.orgId),
      },
    },
    select: {
      role: true,
    },
  });

  if (userInOrg?.role !== "ADMIN" && userInOrg?.role !== "USER") {
    // if user has no business here, return a 404
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "no organisation found with id " + req.query.orgId });
    return;
  }

  switch (req.method) {
    case "GET":
      const org = await prisma.organisation.findUnique({
        where: {
          id: Number(req.query.orgId),
        },
        include: {
          apps: true,
        },
      });

      if (org == null) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: "no organisation found with id " + req.query.orgId,
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        name: org.name,
        apps: org.apps,
        invitationToken: userInOrg?.role === "ADMIN" ? org.invitationToken : "",
      });
      break;

    case "DELETE":
      try {
        if (userInOrg?.role === "USER") {
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "you are not allowed to delete organisation with id " +
              req.query.orgId,
          });
          return;
        }
        await prisma.usersInOrganisations.deleteMany({
          where: {
            orgId: Number(req.query.orgId),
          },
        });

        // remove relationships between the to-be-deleted organisation and its users
        await prisma.usersInOrganisations.deleteMany({
          where: {
            orgId: Number(req.query.orgId),
          },
        });

        const deletedOrg = await prisma.organisation.delete({
          where: {
            id: Number(req.query.orgId),
          },
        });

        res.status(StatusCodes.OK).json(deletedOrg);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "no org found with id " + req.query.orgId });
          return;
        }
      }
      break;

    case "PUT":
      try {
        if (userInOrg?.role === "USER") {
          res.status(StatusCodes.FORBIDDEN).json({
            message:
              "you are not allowed to update organisation with id " +
              req.query.orgId,
          });
        }
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
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "no org found with id " + req.query.orgId });
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
