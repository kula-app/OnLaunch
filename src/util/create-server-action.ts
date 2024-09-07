import { ServerError } from '../errors/server-error';

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
 * @param callback - The callback function to be wrapped.
 * @returns A new function that executes the callback function and handles any errors.
 */
export function createServerAction<TArgs extends any[], TResult>(
  callback: (...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs) => {
    try {
      const value = await callback(...args);
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
      throw error;
    }
  };
}
