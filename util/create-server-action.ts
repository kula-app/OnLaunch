import { ServerError } from "../errors/server-error";

export function createServerAction<TArgs extends any[], TResult>(
  callback: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs) => {
    try {
      const value = await callback(...args);
      return {
        success: true,
        value: value,
      };
    } catch (error) {
      // React filters out errors for better security.
      // If we want to send an error to the client, we need to throw an instance of ServerError
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
