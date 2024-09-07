/**
 * Tries to parse the given value into a boolean.
 * Returns `undefined` if the value is `undefined`.
 *
 * @param value String value from the environment, e.g. `process.env.MY_ENV_VAR`
 * @returns
 */
export function parseBooleanEnvValue(value?: string): boolean | undefined {
  if (value == undefined) {
    return undefined;
  }
  return value.toLowerCase() === 'true';
}
