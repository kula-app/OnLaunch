import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class UserEmailTakenError extends ServerError {
  constructor(message: string = "Email address not available!") {
    super(CustomErrorNames.UserEmailTakenError, message);
  }
}
