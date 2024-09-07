import { CustomErrorNames } from './custom-error-names';
import { ServerError } from './server-error';

export class TokenExpiredError extends ServerError {
  constructor(message = 'Token has expired') {
    super(CustomErrorNames.TokenExpiredError, message);
  }
}
