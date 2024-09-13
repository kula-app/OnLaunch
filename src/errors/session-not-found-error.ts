import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class SessionNotFoundError extends ServerError {
  constructor(message: string = "No session found") {
    super(CustomErrorNames.SessionNotFoundError, message);
  }
}
