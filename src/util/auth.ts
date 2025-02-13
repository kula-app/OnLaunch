import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import type { OrgUser } from "@/models/org-user";
import type { User } from "@/models/user";
import prisma from "@/services/db";
import { compare, genSalt, hash } from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { loadServerConfig } from "../config/loadServerConfig";
import { createChangeEmailTemplate } from "../mailTemplate/changeEmail";
import { createDirectInviteTemplate } from "../mailTemplate/directInvite";
import { createDirectInviteNewUserTemplate } from "../mailTemplate/directInviteNewUser";
import { createEmailChangedTemplate } from "../mailTemplate/emailChanged";
import { createResetPasswordTemplate } from "../mailTemplate/resetPassword";
import { createVerificationTemplate } from "../mailTemplate/verification";
import { MailType } from "../models/mailType";
import { Routes } from "../routes/routes";
import { authOptions } from "./auth-options";
import { ifEmptyThenUndefined } from "./ifEmptyThenUndefined";
import { Logger } from "./logger";
import { PrismaDataUtils } from "./prisma-data-utils";
import { generateRandomHex } from "./random";

const nodemailer = require("nodemailer");

const logger = new Logger(__filename);

export async function hashAndSaltPassword(password: string) {
  logger.log("Salting and hashing password");
  const saltRounds = 10;

  const salt = await genSalt(saltRounds);
  const hashedSaltedPassword = await hash(password.concat(salt), 12);

  return {
    salt: salt,
    hashedSaltedPassword: hashedSaltedPassword,
  };
}

export async function validatePassword(password: string) {
  logger.log("Validating password");

  return password && password.trim().length >= 8;
}

export async function verifyPassword(
  password: string,
  salt: string,
  hashedPassword: string,
) {
  logger.log("Verifying password");
  const isValid = await compare(password.concat(salt), hashedPassword);
  return isValid;
}

export function generateToken() {
  logger.log("Generating token");
  return generateRandomHex(32);
}

export function sendTokenPerMail({
  email,
  firstName,
  token,
  mailType,
}: {
  email: string;
  firstName: string | null;
  token: string;
  mailType: MailType;
}) {
  logger.log(`Sending mail of type '${mailType}'`);

  const config = loadServerConfig();
  const smtpConfig = config.smtp;

  let transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    auth: ifEmptyThenUndefined(smtpConfig.user) !== undefined && {
      user: ifEmptyThenUndefined(smtpConfig.user),
      pass: ifEmptyThenUndefined(smtpConfig.pass),
    },
  });

  const senderName = config.emailContent.senderName;

  switch (mailType) {
    case MailType.Verification:
      const verificationTemplate = createVerificationTemplate(
        firstName,
        Routes.getAccountVerificationUrl({
          baseUrl: config.baseConfig.url,
          token,
          email,
        }),
        senderName,
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
        Routes.getAccountConfirmationUrl({
          baseUrl: config.baseConfig.url,
          token,
        }),
        senderName,
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
        Routes.getAccountConfirmEmailUrl({
          baseUrl: config.baseConfig.url,
          token,
        }),
        senderName,
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
        senderName,
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
        Routes.getOrganizationDirectInvitationUrl({
          baseUrl: config.baseConfig.url,
          token,
        }),
        senderName,
      );

      transporter.sendMail({
        from: getSenderData(senderName),
        to: email,
        subject: directInviteTemplate.subject,
        text: directInviteTemplate.text,
        html: directInviteTemplate.html,
      });
      break;

    case MailType.DirectInviteNewUser:
      const directInviteNewUserTemplate = createDirectInviteNewUserTemplate(
        Routes.getOrganizationDirectInvitationUrl({
          baseUrl: config.baseConfig.url,
          token,
        }),
        senderName,
      );

      transporter.sendMail({
        from: getSenderData(senderName),
        to: email,
        subject: directInviteNewUserTemplate.subject,
        text: directInviteNewUserTemplate.text,
        html: directInviteNewUserTemplate.html,
      });
      break;
  }

  function getSenderData(senderName: string) {
    return `"${senderName}" <${config.emailContent.senderAddress}>`;
  }
}

export async function getUserFromRequest(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<User | undefined> {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    logger.error("User not authorized");
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized!" });
    return;
  }

  logger.log("Returning user after checking authorization");
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: session.user.id,
    },
  });
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
export async function getUserWithRoleFromRequest(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<
  | (OrgUser & {
      orgId: Org["id"];
    })
  | undefined
> {
  const user = await getUserFromRequest(req, res);

  if (!user) {
    logger.error("No user provided from session");
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "You are not logged in",
    });
    return;
  }

  logger.log(
    `Looking up user with id '${user.id}' in organisation '${
      req.body.orgId ? req.body.orgId : req.query.orgId
    }'`,
  );
  const userInOrg = await prisma.usersInOrganisations.findFirst({
    where: {
      user: {
        id: Number(user.id),
      },
      org: {
        id: Number(req.body.orgId ? req.body.orgId : req.query.orgId),
      },
    },
    select: {
      role: true,
      orgId: true,
      user: true,
    },
  });

  if (!userInOrg) {
    logger.error(
      `User with id '${user.id}' not found in organisation with id '${req.query.orgId}'`,
    );
    // if user has no business here, return a 404
    res.status(StatusCodes.NOT_FOUND).json({
      message: `no user with id '${user.id}' found in organisation with id '${req.query.orgId}'`,
    });
    return;
  }

  return {
    id: user.id,
    firstName: userInOrg?.user.firstName,
    lastName: userInOrg?.user.lastName,
    email: user.email,

    orgId: userInOrg?.orgId,
    role:
      PrismaDataUtils.mapUserRoleFromPrisma(userInOrg?.role) ?? OrgRole.USER,
  };
}
