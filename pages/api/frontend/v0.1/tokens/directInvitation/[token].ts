import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.query;

  const { token } = data;

  const session = await getSession({ req: req });

  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized!" });
    return;
  }

  const id = session.user?.id;

  const userInvitationToken = await prisma.userInvitationToken.findFirst({
    where: {
      token: token as string,
    },
  });

  if (!userInvitationToken) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `No user invitation token found with ${token}!` });
    return;
  }

  if (
    userInvitationToken.isArchived ||
    userInvitationToken.isObsolete ||
    userInvitationToken.expiryDate < new Date()
  ) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `User invitation token is obsolete!` });
    return;
  }

  const organisation = await prisma.organisation.findFirst({
    where: {
      id: userInvitationToken.orgId,
    },
  });

  if (!organisation) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        message: `No organisation found with id ${userInvitationToken.orgId}!`,
      });
    return;
  }

  switch (req.method) {
    case "GET":
      res.status(StatusCodes.OK).json({
        id: organisation.id,
        name: organisation.name,
        invitationToken: userInvitationToken.token,
      });

      break;

    case "POST":
      try {
        await prisma.usersInOrganisations.create({
          data: {
            userId: id,
            orgId: organisation.id,
            role: "USER",
          },
        });

        await prisma.userInvitationToken.update({
          where: {
            token: userInvitationToken.token,
          },
          data: {
            isArchived: true,
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

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
