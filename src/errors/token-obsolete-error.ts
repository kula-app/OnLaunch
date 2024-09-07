import { CustomErrorNames } from './custom-error-names';
import { ServerError } from './server-error';

export class TokenObsoleteError extends ServerError {
  constructor(message = 'Verification token is obsolete') {
    super(CustomErrorNames.TokenObsoleteError, message);
  }
}
