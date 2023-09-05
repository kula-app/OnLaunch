import { PrismaClient } from "@prisma/client";
import { Logger } from "../logger";
import { reportOrgToStripe } from "./reportUsage";

const prisma: PrismaClient = new PrismaClient();

export async function reportAllOrgsToStripe() {
  const logger = new Logger(__filename);
  logger.log(`Usage reporting called for all orgs`);

  const orgs = await prisma.organisation.findMany({});

  logger.log(
    `Found this many organisations to report usage for: ${orgs.length}`
  );
  for (const org of orgs) {
    try {
      await reportOrgToStripe(org.id);
    } catch (error: any) {
      logger.error(
        `Failed reporting for organisation(id = ${org.id}), reason: ${error}`
      );
    }
  }
  logger.log(
    `Finished reporting ${orgs.length} organisations`
  );
}
