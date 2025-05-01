import { ServerError } from "@/errors/server-error";
import { ValidationError } from "@/errors/validation-error";
import * as Yup from "yup";

/**
 * The response object returned by a server action.
 *
 * @template TResult - The type of the result returned by the server action.
 */
export type ServerActionResponse<TResult> =
  | {
      success: true;
      value: TResult;
    }
  | {
      success: false;
      error: {
        name: string;
        message: string;
      };
    };

/**
 * The type of a server action function.
 *
 * @template TArgs - The type of the arguments accepted by the server action.
 * @template TResult - The type of the result returned by the server action.
 */
export type ServerActionFunction<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

/**
 * The type of a wrapped server action function.
 * This function will return an object with a success flag and either the value returned by the server action or an error object.
 * The error object will contain the name and message of the error.
 *
 * @template TArgs - The type of the arguments accepted by the server action.
 * @template TResult - The type of the result returned by the server action.
 */
export type WrappedServerActionFunction<
  TArgs extends unknown[],
  TResult,
> = ServerActionFunction<TArgs, ServerActionResponse<TResult>>;

/**
 * Creates a server action that wraps a callback function.
 *
 * React filters out errors for better security, therefore we need to catch errors and handle them ourselves.
 * If we want to send an error to the client, we need to throw an instance of ServerError, as any other error will be filtered out.
 *
 * The server action will return an object with a success flag and either the value returned by the callback function or an error object.
 *
 * @template TArgs - The type of the arguments accepted by the callback function.
 * @template TResult - The type of the result returned by the callback function.
 *
 * @param action - The action function to be wrapped.
 * @returns A new function that executes the callback function and handles any errors.
 */
export function createServerAction<TResult, TArgs extends unknown[]>(
  action: ServerActionFunction<TArgs, TResult>,
): WrappedServerActionFunction<TArgs, TResult> {
  return async (...args: TArgs): Promise<ServerActionResponse<TResult>> => {
    try {
      const value = await action(...args);
      return {
        success: true,
        value: value,
      };
    } catch (error) {
      if (error instanceof ServerError) {
        return {
          success: false,
          error: {
            name: error.name,
            message: error.message,
          },
        };
      }
      if (error instanceof Yup.ValidationError) {
        const mappedError = new ValidationError(error.message);
        return {
          success: false,
          error: {
            name: mappedError.name,
            message: mappedError.message,
          },
        };
      }
      throw error;
    }
  };
}
