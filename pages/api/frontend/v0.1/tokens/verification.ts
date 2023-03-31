import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { generateToken, sendTokenPerMail } from "../../../../../util/auth";
import { StatusCodes } from "http-status-codes";
import { MailType } from "../../../../../models/mailType";

require("dotenv").config();

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;

  const { token } = data;

  if (!token) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "No token provided!" });
    return;
  }

  switch (req.method) {
    case "PUT":
      const lookupToken = await prisma.verificationToken.findFirst({
        where: {
          token: token,
        },
      });

      if (!lookupToken) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Verification token not found!" });
        return;
      }

      if (lookupToken && lookupToken.isArchived) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "User already verified!" });
        return;
      }

      if (lookupToken && lookupToken.isObsolete) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Verification token is obsolete!" });
        return;
      }

      // if token expired and user not verified, create new token and send it to user
      if (lookupToken && lookupToken.expiryDate < new Date()) {
        const generatedToken = generateToken();

        var expiryDate = new Date();
        // set expiryDate one week from now
        expiryDate.setDate(expiryDate.getDate() + 7);

        await prisma.verificationToken.updateMany({
          where: {
            userId: lookupToken.userId,
            isObsolete: false,
          },
          data: {
            isObsolete: true,
          },
        });

        const verificationToken = await prisma.verificationToken.create({
          data: {
            userId: lookupToken.userId,
            token: generatedToken,
            expiryDate: expiryDate,
            isArchived: false,
          },
        });

        const user = await prisma.user.findUnique({
          where: {
            id: lookupToken.userId,
          },
        });

        sendTokenPerMail(
          user?.email as string,
          user?.firstName as string,
          verificationToken.token,
          MailType.Verification
        );

        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Verification token expired!" });
        return;
      }

      const user = await prisma.user.update({
        where: {
          id: lookupToken.userId,
        },
        data: {
          isVerified: true,
        },
      });

      await prisma.verificationToken.update({
        where: {
          id: lookupToken.id,
        },
        data: {
          isArchived: true,
        },
      });

      res.status(StatusCodes.OK).json(user.email);
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
