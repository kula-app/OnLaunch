import { NextApiRequest, NextApiResponse } from "next";
import { User } from "../models/user";
import { getUserFromRequest, getUserWithRoleFromRequest } from "./auth";

// Defines types for the handler to know which authentication method to use
type AuthMethod = "withRole" | "basic";

interface AuthenticatedHandlerOptions {
  method: AuthMethod;
}

export async function authenticatedHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  options: AuthenticatedHandlerOptions,
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    user: User,
  ) => Promise<void>,
): Promise<void> {
  let user;

  if (options.method === "withRole") {
    user = await getUserWithRoleFromRequest(req, res);
  } else {
    user = await getUserFromRequest(req, res);
  }

  if (!user) {
    // The response is already set in the above called function getUser(WithRole)FromRequest
    return;
  }

  return handler(req, res, user);
}
