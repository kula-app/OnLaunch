import { CustomErrorNames } from './custom-error-names';
import { ServerError } from './server-error';

export class BadRequestError extends ServerError {
  constructor(message: string = 'Bad request') {
    super(CustomErrorNames.BadRequestError, message);
  }
}
