import * as crypto from 'crypto';

export function generateRandomHex(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}
