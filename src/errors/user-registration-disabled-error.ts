import { CustomErrorNames } from './custom-error-names';
import { ServerError } from './server-error';

export class UserRegistrationDisabledError extends ServerError {
  constructor(message: string = 'User registration is disabled') {
    super(CustomErrorNames.UserRegistrationDisabledError, message);
  }
}
