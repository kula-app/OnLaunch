import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class ForbiddenError extends ServerError {
  constructor(message: string = "Forbidden") {
    super(CustomErrorNames.ForbiddenError, message);
  }
}
