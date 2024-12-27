import type { Org } from "@/models/org";
import type { User } from "@/models/user";
import { NextApiRequest, NextApiResponse } from "next";
import { OrgUser } from "../models/org-user";
import { getUserFromRequest, getUserWithRoleFromRequest } from "./auth";

export async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    user: User,
  ) => Promise<void>,
): Promise<void> {
  const user = await getUserFromRequest(req, res);

  if (!user) {
    // The response is already set in the above called function getUser(WithRole)FromRequest
    return;
  }

  return handler(req, res, user);
}

export async function authenticatedUserWithRoleHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    user: OrgUser & {
      orgId: Org["id"];
    },
  ) => Promise<void>,
): Promise<void> {
  const user = await getUserWithRoleFromRequest(req, res);

  if (!user) {
    // The response is already set in the above called function getUser(WithRole)FromRequest
    return;
  }

  return handler(req, res, user);
}
