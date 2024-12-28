import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class ValidationError extends ServerError {
  constructor(message: string) {
    super(CustomErrorNames.ValidationError, message);
  }
}
