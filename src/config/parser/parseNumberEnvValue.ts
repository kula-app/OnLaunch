/**
 * Tries to parse the given value into a number.
 * Returns `undefined` if the value is `undefined`.
 *
 * @param value String value from the environment, e.g. `process.env.MY_ENV_VAR`
 * @returns
 */
export function parseNumberEnvValue(value?: string): number | undefined {
  if (value == undefined) {
    return undefined;
  }
  return Number(value);
}
