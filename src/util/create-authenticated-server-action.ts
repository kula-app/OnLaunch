import { SessionNotFoundError } from "@/errors/session-not-found-error";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "./auth-options";
import {
  createServerAction,
  type WrappedServerActionFunction,
} from "./create-server-action";

type AuthenticatedServerActionFunction<TArgs extends unknown[], TResult> = (
  session: Session,
  ...args: TArgs
) => Promise<TResult>;

/**
 * Creates a server action that wraps a callback function with an authentication check.
 *
 * React filters out errors for better security, therefore we need to catch errors and handle them ourselves.
 * If we want to send an error to the client, we need to throw an instance of ServerError, as any other error will be filtered out.
 *
 * The server action will return an object with a success flag and either the value returned by the callback function or an error object.
 *
 * @template TArgs - The type of the arguments accepted by the callback function.
 * @template TResult - The type of the result returned by the callback function.
 *
 * @param callback - The callback function to be wrapped.
 * @returns A new function that executes the callback function and handles any errors.
 */
export const createAuthenticatedServerAction = <
  TResult,
  TArgs extends unknown[],
>(
  callback: AuthenticatedServerActionFunction<TArgs, TResult>,
): WrappedServerActionFunction<TArgs, TResult> => {
  return async (...args: TArgs) => {
    const serverAction = createServerAction(async (...args: TArgs) => {
      const session = await getServerSession(authOptions);
      if (!session) {
        throw new SessionNotFoundError();
      }

      return callback(session, ...args);
    });
    return serverAction(...args);
  };
};
