import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/services/db";
import { Action } from "../../../../../../models/action";
import { authenticate } from "../../../../../../util/adminApi/auth";
import { decodeToken } from "../../../../../../util/adminApi/tokenDecoding";
import { Logger } from "../../../../../../util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const authToken = await authenticate(req, res, "app");

  // When no authToken has been returned, then the NextApiResponse
  // has already ended with an error
  if (!authToken) return;

  const tokenInfo = decodeToken(authToken);

  switch (req.method) {
    // Create new message
    case "POST":
      if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
        logger.log("Start date has to be before end date");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Start date has to be before end date" });
      }

      logger.log(`Creating message for app id '${req.query.appId}'`);
      const message = await prisma.message.create({
        data: {
          blocking: req.body.blocking,
          title: req.body.title,
          body: req.body.body,
          startDate: new Date(req.body.startDate),
          endDate: new Date(req.body.endDate),
          appId: tokenInfo?.id,
        },
      });

      if (req.body.actions.length > 0) {
        logger.log(`Creating actions for message with id '${message.id}'`);
        const actions: Action[] = req.body.actions;
        actions.forEach((action) => {
          action.messageId = message.id;
        });
        await prisma.action.createMany({
          data: req.body.actions,
        });
      }

      return res.status(StatusCodes.CREATED).json(message);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
