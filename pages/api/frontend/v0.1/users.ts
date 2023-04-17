import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { getUserFromRequest } from "../../../../util/auth";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getUserFromRequest(req, res)

  if (!user) {
    return;
  }

  switch (req.method) {
    case "GET":
      const userFromDb = await prisma.user.findFirst({
        where: {
          id: Number(user.id),
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!userFromDb || (userFromDb && !userFromDb.id)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
        return;
      }

      res.status(StatusCodes.CREATED).json({
        email: userFromDb.email,
        firstName: userFromDb.firstName,
        lastName: userFromDb.lastName,
      });
      break;

    case "DELETE":
      const userEmail2 = user.email as string;

      const userFromDb2 = await prisma.user.findFirst({
        where: {
          email: userEmail2,
          NOT: {
            isDeleted: true,
          },
        },
      });

      if (!userFromDb2 || (userFromDb2 && !userFromDb2.id)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User not found!" });
        return;
      }

      // check if user is qualified to be deleted
      const userInOrgs = await prisma.usersInOrganisations.findMany({
        where: {
          user: {
            id: userFromDb2.id,
          },
          role: "ADMIN",
        },
      });

      let orgsToDeleteFirst: Array<number> = [];

      await Promise.all(
        userInOrgs.map(async (userInOrg) => {
          const otherAdminsInOrg = await prisma.usersInOrganisations.findMany({
            where: {
              orgId: userInOrg.orgId,
              role: "ADMIN",
              NOT: {
                userId: userInOrg.userId,
              },
            },
          });

          if (Array.isArray(otherAdminsInOrg) && !otherAdminsInOrg.length) {
            orgsToDeleteFirst.push(userInOrg.orgId);
          }
        })
      );

      if (orgsToDeleteFirst.length) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "You have to delete these organisations first: " +
            JSON.stringify(orgsToDeleteFirst),
        });
        return;
      }

      // if user qualifies to be deleted:
      const deletedUser = await prisma.user.update({
        where: {
          id: userFromDb2.id,
        },
        data: {
          email: null,
          firstName: null,
          lastName: null,
          password: null,
          salt: null,
          isDeleted: true,
        },
      });

      // delete user from organisations
      await prisma.usersInOrganisations.deleteMany({
        where: {
          userId: deletedUser.id,
        },
      });

      res.status(StatusCodes.CREATED).json({ deletedUser });
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
