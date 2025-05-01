import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class BadRequestError extends ServerError {
  constructor(message: string = "Bad Request") {
    super(CustomErrorNames.BadRequestError, message);
  }
}
