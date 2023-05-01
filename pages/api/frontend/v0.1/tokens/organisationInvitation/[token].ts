import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getUserFromRequest, generateToken } from "../../../../../../util/auth";
import { StatusCodes } from "http-status-codes";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.query;

  const { token } = data;

  const user = await getUserFromRequest(req, res)

  if (!user) {
    return;
  }

  const organisation = await prisma.organisation.findFirst({
    where: {
      invitationToken: token as string,
    },
  });

  if (!organisation) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `No organisation found with invite ${token}!` });
    return;
  }

  switch (req.method) {
    case "GET":
      res.status(StatusCodes.OK).json({
        id: organisation.id,
        name: organisation.name,
        invitationToken: organisation.invitationToken,
      });

      break;

    case "POST":
      try {
        await prisma.usersInOrganisations.create({
          data: {
            userId: user.id,
            orgId: organisation.id,
            role: "USER",
          },
        });
      } catch (error) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `User already in organisation!` });
        return;
      }

      res.status(StatusCodes.OK).json({ message: `User joined organisation!` });
      break;

    case "PUT":
      const generatedToken = generateToken();

      await prisma.organisation.update({
        where: {
          id: organisation.id,
        },
        data: {
          invitationToken: generatedToken,
        },
      });

      res.status(StatusCodes.OK).json({ message: `Updated organisation!` });
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
