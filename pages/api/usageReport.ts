import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import { loadConfig } from "../../config/loadConfig";
import { Logger } from "../../util/logger";
import { reportAllOrgsToStripe } from "../../util/stripe/reportAllUsage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const config = loadConfig();
  const logger = new Logger(__filename);

  if (
    req.headers.authorization !== `Bearer ${config.usageReport.apiKey}` &&
    req.headers.authorization !== config.usageReport.apiKey
  ) {
    logger.error("Authorization of request failed - access denied!");
    return res.status(StatusCodes.FORBIDDEN).json({
      error: {
        message: "Access denied!",
      },
    });
  }

  switch (req.method) {
    case "POST":
      try {
        // Sequentially report the usage of all orgs
        logger.log("Running usage reports for all organisations");

        await reportAllOrgsToStripe();

        res.status(StatusCodes.OK).end("Reported usage for all organisations");
      } catch (error) {
        // If either prisma throws an error, it is assumed that all the other
        // reports will fail as well, thus returning an error instead of proceeding
        logger.error(`Error: ${error}`);
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .end("Error during reporting usage, please try again later!");
      }

      break;

    default:
      res.status(StatusCodes.METHOD_NOT_ALLOWED).end("method not allowed");
      break;
  }
}
