import { compare, genSalt, hash } from "bcrypt";
import { loadConfig } from "../config/loadConfig";
import { createChangeEmailTemplate } from "../mailTemplate/changeEmail";
import { createDirectInviteTemplate } from "../mailTemplate/directInvite";
import { createEmailChangedTemplate } from "../mailTemplate/emailChanged";
import { createResetPasswordTemplate } from "../mailTemplate/resetPassword";
import { createVerificationTemplate } from "../mailTemplate/verification";
import { MailType } from "../models/mailType";
import Routes from "../routes/routes";
import { ifEmptyThenUndefined } from "./ifEmptyThenUndefined";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
var crypto = require("crypto");
var base64url = require("base64url");

const nodemailer = require("nodemailer");

export async function hashAndSaltPassword(password: string) {
  const saltRounds = 10;

  const salt = await genSalt(saltRounds);
  const hashedSaltedPassword = await hash(password.concat(salt), 12);

  return {
    salt: salt,
    hashedSaltedPassword: hashedSaltedPassword,
  };
}

export async function validatePassword(password: string) {
  return password && password.trim().length >= 8;
}

export async function verifyPassword(
  password: string,
  salt: string,
  hashedPassword: string
) {
  const isValid = await compare(password.concat(salt), hashedPassword);
  return isValid;
}

export function generateToken() {
  return base64url(crypto.randomBytes(32));
}

export function sendTokenPerMail(
  email: string,
  firstName: string,
  token: string,
  mailType: MailType
) {
  const config = loadConfig();
  let transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: ifEmptyThenUndefined(config.smtp.user) !== undefined && {
      user: ifEmptyThenUndefined(config.smtp.user),
      pass: ifEmptyThenUndefined(config.smtp.pass),
    },
  });

  const senderName = config.emailContent.senderName as string;

  switch (mailType) {
    case MailType.Verification:
      const verificationTemplate = createVerificationTemplate(
        firstName,
        Routes.verifyWithToken(token),
        senderName
      );

      transporter.sendMail({
        from: getSenderData(senderName),
        to: email,
        subject: verificationTemplate.subject,
        text: verificationTemplate.text,
        html: verificationTemplate.html,
      });
      break;

    case MailType.ResetPassword:
      const resetPasswordTemplate = createResetPasswordTemplate(
        firstName,
        Routes.resetPasswordWithToken(token),
        senderName
      );

      transporter.sendMail({
        from: getSenderData(senderName),
        to: email,
        subject: resetPasswordTemplate.subject,
        text: resetPasswordTemplate.text,
        html: resetPasswordTemplate.html,
      });
      break;

    case MailType.ChangeEmail:
      const changeEmailTemplate = createChangeEmailTemplate(
        firstName,
        Routes.changeEmailWithToken(token),
        senderName
      );

      transporter.sendMail({
        from: getSenderData(senderName),
        to: email,
        subject: changeEmailTemplate.subject,
        text: changeEmailTemplate.text,
        html: changeEmailTemplate.html,
      });
      break;

    case MailType.EmailChanged:
      const emailChangedTemplate = createEmailChangedTemplate(
        firstName,
        senderName
      );

      transporter.sendMail({
        from: getSenderData(senderName),
        to: email,
        subject: emailChangedTemplate.subject,
        text: emailChangedTemplate.text,
        html: emailChangedTemplate.html,
      });
      break;

    case MailType.DirectInvite:
      const directInviteTemplate = createDirectInviteTemplate(
        firstName,
        Routes.directInviteWithToken(token),
        senderName
      );

      transporter.sendMail({
        from: getSenderData(senderName),
        to: email,
        subject: directInviteTemplate.subject,
        text: directInviteTemplate.text,
        html: directInviteTemplate.html,
      });
      break;
  }

  function getSenderData(senderName: string) {
    return `"${senderName}" <${config.emailContent.senderAddress}>`;
  }
}

export async function getUserFromRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized!" });
    return;
  }

  return session.user;
}
export async function getUserWithRoleFromRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient
) {
  const user = await getUserFromRequest(req, res);

  if (!user) {
    return;
  }

  const userInOrg = await prisma.usersInOrganisations.findFirst({
    where: {
      user: {
        id: Number(user.id),
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

  return { role: userInOrg?.role, id: user.id, email: user.email };
}
