"use server";

import { NotFoundError } from "@/errors/not-found-error";
import type { Org } from "@/models/org";
import prisma from "@/services/db";
import { createServerAction } from "@/util/create-server-action";
import { Logger } from "@/util/logger";

const logger = new Logger(__filename);

export const getInviteByToken = createServerAction(
  async (token: string): Promise<Pick<Org, "id" | "name">> => {
    logger.log(`Fetching with token '${token}'`);

    const organisation = await prisma.organisation.findFirst({
      where: {
        invitationToken: token as string,
        isDeleted: false,
      },
    });
    if (!organisation) {
      logger.error(`No organisation found`);
      throw new NotFoundError("Organisation not found");
    }

    return {
      id: organisation.id,
      name: organisation.name,
    };
  },
);
