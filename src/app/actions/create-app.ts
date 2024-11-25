"use server";

import { SessionNotFoundError } from "@/errors/session-not-found-error";
import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { generateToken } from "@/util/auth";
import { authOptions } from "@/util/auth-options";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";
import { getServerSession } from "next-auth";

const logger = new Logger(__filename);

export const createApp = createServerAction(
  async ({ orgId, name }: { orgId: Org["id"]; name: string }): Promise<App> => {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new SessionNotFoundError();
    }

    logger.log(`Creating app '${name}' for org id '${orgId}'`);
    const app = await prisma.app.create({
      data: {
        name: name,
        orgId: orgId,
        publicKey: generateToken(),
      },
    });
    logger.log(`Created app with id '${app.id}'`);

    return {
      id: app.id,
      name: app.name,
    };
  },
);
