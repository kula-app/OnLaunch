import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../../auth/[...nextauth]";

const prisma = new PrismaClient();

enum ActionType {
  Dismiss = "DISMISS",
}

enum ButtonDesign {
  Text = "TEXT",
  Filled = "FILLED",
}

type Action = {
  id: number;
  actionType: ActionType;
  buttonDesign: ButtonDesign;
  title: string;
  messageId: number;
};

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
      .json({ message: "organisation not found" });
    return;
  }

  switch (req.method) {
    case "GET":
      const allMessages = await prisma.message.findMany({
        include: {
          actions: true,
        },
        where: {
          appId: Number(req.query.appId),
        },
      });

      res.status(StatusCodes.OK).json(allMessages);
      break;

    case "POST":
      if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "start date has to be before end date" });
        return;
      }

      const message = await prisma.message.create({
        data: {
          blocking: req.body.blocking,
          title: req.body.title,
          body: req.body.body,
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          appId: req.body.appId,
        },
      });

      if (req.body.actions.length > 0) {
        const actions: Action[] = req.body.actions;
        actions.forEach((action) => {
          action.messageId = message.id;
        });
        await prisma.action.createMany({
          data: req.body.actions,
        });
      }

      res.status(StatusCodes.CREATED).json(message);
      break;

    default:
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
      return;
  }
}
