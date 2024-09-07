import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class EmailConflictError extends ServerError {
  constructor(message: string = "Email already in use") {
    super(CustomErrorNames.EmailConflictError, message);
  }
}
