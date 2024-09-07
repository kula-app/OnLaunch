import { ServerError } from './server-error';

export class ValidationError extends ServerError {
  constructor(message: string) {
    super('ValidationError', message);
  }
}
