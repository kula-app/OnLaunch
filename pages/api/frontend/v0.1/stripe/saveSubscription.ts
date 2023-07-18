import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { Logger } from "../../../../../util/logger";
import { StatusCodes } from "http-status-codes";
import { loadConfig } from "../../../../../config/loadConfig";
import { generateToken, getUserFromRequest } from "../../../../../util/auth";
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = new Logger(__filename);

  const user = await getUserFromRequest(req, res);

  if (!user) {
    logger.error("User not logged in");
    return;
  }

  switch (req.method) {
    case "POST":
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2022-11-15",
      });

      if (!req.body.sessionId) {
        logger.error("No parameter sessionId provided");
        res
          .status(StatusCodes.BAD_REQUEST)
          .end("No parameter sessionId provided");
      }

      if (!req.body.orgName) {
        logger.error("No parameter orgName provided");
        res
          .status(StatusCodes.BAD_REQUEST)
          .end("No parameter orgName provided");
      }

      try {
        const session = await stripe.checkout.sessions.retrieve(
          req.body.sessionId as string,
          {
            expand: ["subscription"],
          }
        );
        logger.log("session: " + JSON.stringify(session));
        
        const generatedToken = generateToken();

        // create new org and sub
        logger.log(`Creating new organisation for user with id '${user.id}' and create subscription`);
        const obj = await prisma.usersInOrganisations.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            role: "ADMIN",
            org: {
              create: {
                name: req.body.orgName as string,
                invitationToken: generatedToken,
                subs: {
                  create: {
                    subId: (session.subscription as Stripe.Subscription)
                      .id as string,
                    subName: (session.subscription as Stripe.Subscription).items
                      .data[0].price.nickname as string,
                    user: {
                      connect: {
                        id: user.id,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // save customer id
        const updatedUser = await prisma.user.updateMany({
          where: {
            id: user.id,
            customer: null,
          },
          data: {
            customer: session.customer as string,
          },
        });

        return res.json(session.customer);
      } catch (error) {
        logger.error(`Error during Stripe communication: ${error}`);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
      }
      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
