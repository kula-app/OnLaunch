import { PrismaClient } from "@prisma/client";
import { Logger } from "./logger";

const logger = new Logger(__filename);

export async function saveCreatedSubscription(password: string, 
  prisma: PrismaClient) {
  logger.log("Salting and hashing password");
  const saltRounds = 10;
  return {
    salt: salt,
    hashedSaltedPassword: hashedSaltedPassword,
  };
}
