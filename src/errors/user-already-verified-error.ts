import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class UserAlreadyVerifiedError extends ServerError {
  constructor(message: string = "User is already verified") {
    super(CustomErrorNames.UserAlreadyVerifiedError, message);
  }
}
