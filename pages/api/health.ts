// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as os from "os";

type Data = {
  status: string;
  hostname: string;
  uptime: number;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    status: "ok",
    hostname: os.hostname(),
    uptime: process.uptime(),
  });
}
