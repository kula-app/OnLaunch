import { StatusCodes } from "http-status-codes";
import type { NextApiRequest, NextApiResponse } from "next";
import * as os from "os";
import { loadConfig } from "../../config/loadConfig";

type Data = {
  status: string;
  hostname: string;
  uptime: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | {}>
) {
  const config = loadConfig();
  if (req.headers.authorization !== `token ${config.health.apiKey}`) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: {
        message: "Invalid API Key",
      },
    });
  }
  res.status(StatusCodes.OK).json({
    status: "ok",
    hostname: os.hostname(),
    uptime: process.uptime(),
  });
}
