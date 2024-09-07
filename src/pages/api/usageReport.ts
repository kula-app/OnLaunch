import { loadServerConfig } from '@/config/loadServerConfig';
import { Logger } from '@/util/logger';
import { reportAllOrgsToStripe } from '@/util/stripe/reportAllUsage';
import { StatusCodes } from 'http-status-codes';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const logger = new Logger(__filename);
  const usageReportingConfig = loadServerConfig().usageReport;
  const stripeConfig = loadServerConfig().stripeConfig;

  if (!stripeConfig.isEnabled) {
    logger.error('stripe is disabled but endpoint has been called');
    return res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .json({ message: 'Endpoint is disabled' });
  }

  if (
    req.headers.authorization !== `Bearer ${usageReportingConfig.apiKey}` &&
    req.headers.authorization !== usageReportingConfig.apiKey
  ) {
    logger.error('Authorization of request failed - access denied!');
    return res.status(StatusCodes.FORBIDDEN).json({
      error: {
        message: 'Access denied!',
      },
    });
  }

  switch (req.method) {
    case 'POST':
      try {
        // Sequentially report the usage of all orgs
        logger.log('Running usage reports for all organisations');

        await reportAllOrgsToStripe();

        return res
          .status(StatusCodes.OK)
          .json({ message: 'Reported usage for all organisations' });
      } catch (error) {
        // If either prisma throws an error, it is assumed that all the other
        // reports will fail as well, thus returning an error instead of proceeding
        logger.error(`Error: ${error}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Error during reporting usage, please try again later!',
        });
      }

    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ message: 'Method not allowed' });
  }
}
