import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class NotFoundError extends ServerError {
  constructor(message: string) {
    super(CustomErrorNames.NotFoundError, message);
  }
}
