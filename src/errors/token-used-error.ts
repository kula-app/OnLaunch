import { CustomErrorNames } from './custom-error-names';
import { ServerError } from './server-error';

export class TokenUsedError extends ServerError {
  constructor(message = 'Token has already been used') {
    super(CustomErrorNames.TokenUsedError, message);
  }
}
