import type { NextApiRequest, NextApiResponse } from "next";
import * as os from "os";
import { StatusCodes } from 'http-status-codes';

type Data = {
  status: string;
  hostname: string;
  uptime: number;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(StatusCodes.OK).json({
    status: "ok",
    hostname: os.hostname(),
    uptime: process.uptime(),
  });
}
