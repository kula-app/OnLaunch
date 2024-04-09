import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/services/db";
import { MailType } from "../../../../../models/mailType";
import {
  generateToken,
  getUserFromRequest,
  sendTokenPerMail,
} from "../../../../../util/auth";
import { Logger } from "../../../../../util/logger";

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
  const { emailNew } = req.body;

  const user = await getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  if (!emailNew || !emailNew.includes("@")) {
    logger.error("Email is not valid");
    return res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ message: "Invalid data - email not valid" });
  }

  logger.log(`Looking up user with email '${user.email}'`);
  const userByEmail = await prisma.user.findFirst({
    where: {
      email: user.email,
      NOT: {
        isDeleted: true,
      },
    },
  });

  if (!userByEmail || (userByEmail && !userByEmail.id)) {
    logger.error(`No user found with email '${user.email}'`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User not found!" });
  }

  logger.log(`Looking up user with new email '${emailNew}'`);
  const userWithNewEmail = await prisma.user.findFirst({
    where: {
      email: emailNew,
      NOT: {
        isDeleted: true,
      },
    },
  });

  if (userWithNewEmail) {
    logger.error(`New email '${emailNew}' is already taken`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Email address not available!" });
  }

  const generatedToken = generateToken();

  var expiryDate = new Date();
  // set expiryDate one hour from now
  expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000);

  logger.log(`Updating previous email change tokens obsolete`);
  await prisma.emailChangeToken.updateMany({
    where: {
      userId: user.id,
      isObsolete: false,
    },
    data: {
      isObsolete: true,
    },
  });

  logger.log(
    `Creating new email change token for user with current email '${user.email}'`
  );
  const emailToken = await prisma.emailChangeToken.create({
    data: {
      userId: user.id,
      token: generatedToken,
      expiryDate: expiryDate,
      newEmail: emailNew,
      currentEmail: user.email,
    },
  });

  sendTokenPerMail(
    emailToken.newEmail as string,
    userByEmail.firstName as string,
    generatedToken,
    MailType.ChangeEmail
  );

  return res.status(StatusCodes.CREATED).json(user.email);
}

async function putHandler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.body;

  logger.log(`Looking up email change token`);
  const lookupToken = await prisma.emailChangeToken.findFirst({
    where: {
      token: token,
    },
  });

  if (!lookupToken) {
    logger.error(`Provided email change token not found`);
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Email change token not found" });
  }

  if (
    lookupToken &&
    (lookupToken.isArchived ||
      lookupToken.isObsolete ||
      lookupToken.expiryDate < new Date())
  ) {
    logger.error(`Email change token is obsolete`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Email change token is obsolete!" });
  }

  logger.log(`Updating email of user with id '${lookupToken.userId}'`);
  await prisma.user.update({
    where: {
      id: lookupToken.userId,
    },
    data: {
      email: lookupToken.newEmail,
    },
  });

  sendTokenPerMail(
    lookupToken.currentEmail as string,
    "OnLaunch user",
    "",
    MailType.EmailChanged
  );

  logger.log(`Updating email change token as archived`);
  await prisma.emailChangeToken.update({
    where: {
      id: lookupToken.id,
    },
    data: {
      isArchived: true,
    },
  });

  return res.status(StatusCodes.OK).json(lookupToken.newEmail);
}
