import { Prisma } from "@prisma/client";
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

  const messageId = Number(req.query.messageId);

  switch (req.method) {
    // Retrieve message
    case "GET":
      logger.log(
        `Looking up message with id '${messageId}' for app with id(=${tokenInfo?.id})`
      );
      const message = await prisma.message.findUnique({
        include: {
          actions: true,
        },
        where: {
          id: messageId,
          appId: tokenInfo?.id,
        },
      });

      if (message == null) {
        logger.log(
          `No message found with id '${messageId}' for app with id(=${tokenInfo?.id})`
        );
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: `No message found with id ${messageId}` });
      }

      return res.status(StatusCodes.OK).json(message);

    // Delete message
    case "DELETE":
      try {
        logger.log(
          `Deleting message with id '${messageId}' for app with id(=${tokenInfo?.id})`
        );
        const deletedMessage = await prisma.message.delete({
          where: {
            id: messageId,
            appId: tokenInfo?.id,
          },
        });

        return res.status(StatusCodes.OK).json(deletedMessage);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(
            `No message found with id '${messageId}' for app with id(=${tokenInfo?.id})`
          );
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "No message found with id " + messageId,
          });
        }
      }
      break;

    // Updating new message
    case "PUT":
      try {
        if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
          logger.error("Start date is not before end date");
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Start date has to be before end date" });
        }

        logger.log(
          `Updating message with id '${messageId}' for app with id(=${tokenInfo?.id})`
        );
        const updatedMessage = await prisma.message.update({
          where: {
            id: messageId,
            appId: tokenInfo?.id,
          },
          data: {
            blocking: req.body.blocking,
            title: req.body.title,
            body: req.body.body,
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
          },
        });

        logger.log(`Deleting actions of message with id '${messageId}'`);
        await prisma.action.deleteMany({
          where: {
            messageId: messageId,
          },
        });

        if (req.body.actions.length > 0) {
          const actions: Action[] = req.body.actions;

          actions.forEach((action) => {
            action.messageId = messageId;
          });

          logger.log(`Creating actions for message with id '${messageId}'`);
          await prisma.action.createMany({
            data: req.body.actions,
          });
        }

        return res.status(StatusCodes.CREATED).json(updatedMessage);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          logger.log(`No message found with id '${messageId}'`);
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "No message found with id " + messageId,
          });
        }
      }
      break;

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}
