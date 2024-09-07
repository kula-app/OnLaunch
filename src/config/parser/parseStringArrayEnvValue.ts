/**
 * Tries to parse the given value into a string array.
 * Returns `undefined` if the value is `undefined`.
 *
 * @param value String value from the environment, e.g. `process.env.MY_ENV_VAR`
 * @returns
 */
export function parseStringArrayEnvValue(
  value?: string,
): Array<string> | undefined {
  if (value == undefined || value === "") {
    return undefined;
  }
  return value.split(",");
}
