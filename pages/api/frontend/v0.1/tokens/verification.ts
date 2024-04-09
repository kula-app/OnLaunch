import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { MailType } from "../../../../../models/mailType";
import { generateToken, sendTokenPerMail } from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

require("dotenv").config();

const logger = new Logger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return postHandler(req, res);
    case "PUT":
      return putHandler(req, res);

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: "method not allowed" });
  }
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  var id = -1;
  const { token, email } = req.body;

  if (token) {
    logger.log(`Looking up verification token`);
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
      },
    });

    id = Number(verificationToken?.userId);
  } else if (email) {
    logger.log(`Looking up user with email '${email}'`);
    var userByEmail = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    id = Number(userByEmail?.id);
  } else {
    logger.error("No token or email provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No token or email provided" });
  }

  logger.log(`Looking up user with id '${id}'`);
  const unverifiedUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (unverifiedUser?.isVerified) {
    logger.error("User already verified");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User already verified!" });
  }

  const generatedToken = generateToken();

  var expiryDate = new Date();
  // set expiryDate one week from now
  expiryDate.setDate(expiryDate.getDate() + 7);

  logger.log(
    `Updating previos verification tokens for user with id '${id}' as obsolete`
  );
  await prisma.verificationToken.updateMany({
    where: {
      userId: id,
      isObsolete: false,
    },
    data: {
      isObsolete: true,
    },
  });

  logger.log(`Create new verification token for user with id '${id}'`);
  const verificationToken = await prisma.verificationToken.create({
    data: {
      userId: id,
      token: generatedToken,
      expiryDate: expiryDate,
      isArchived: false,
    },
  });

  sendTokenPerMail(
    unverifiedUser?.email as string,
    unverifiedUser?.firstName as string,
    verificationToken.token,
    MailType.Verification
  );

  return res
    .status(StatusCodes.OK)
    .json({ message: "Link was successfully resend!" });
}

async function putHandler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.body;

  if (!token) {
    logger.error("No token provided");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No token provided" });
  }

  logger.log(`Looking up verification token`);
  const lookupToken = await prisma.verificationToken.findFirst({
    where: {
      token: token,
    },
  });

  if (!lookupToken) {
    logger.error("Provided verification token not found");
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Verification token not found" });
  }

  if (lookupToken && lookupToken.isArchived) {
    logger.error("User already verified");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User already verified" });
  }

  if (lookupToken && lookupToken.isObsolete) {
    logger.error("Verification token is obsolete");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Verification token is obsolete" });
  }

  logger.log(`Looking up user with id '${lookupToken.userId}'`);
  const user = await prisma.user.findUnique({
    where: {
      id: lookupToken.userId,
    },
  });

  if (user?.isVerified) {
    logger.error("User already verified");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User already verified" });
  }

  // if token expired and user not verified, throw error
  if (lookupToken && lookupToken.expiryDate < new Date()) {
    logger.error("Provided verification token has expired");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Verification token has expired" });
  }

  logger.log(`Updating user with id '${lookupToken.userId}' as verified`);
  await prisma.user.update({
    where: {
      id: lookupToken.userId,
    },
    data: {
      isVerified: true,
    },
  });

  logger.log(`Updating verification token as archived`);
  await prisma.verificationToken.update({
    where: {
      id: lookupToken.id,
    },
    data: {
      isArchived: true,
    },
  });

  return res.status(StatusCodes.OK).json(user?.email);
}
