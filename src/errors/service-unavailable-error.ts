import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class ServiceUnavailableError extends ServerError {
  constructor(message: string = "Service Unavailable") {
    super(CustomErrorNames.ServiceUnavailableError, message);
  }
}
