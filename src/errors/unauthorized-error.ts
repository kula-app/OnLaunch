import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class UnauthorizedError extends ServerError {
  constructor(message: string = "Unauthorized") {
    super(CustomErrorNames.UnauthorizedError, message);
  }
}
