/**
 * Tries to parse the given value into a boolean.
 * Returns `undefined` if the value is `undefined`.
 *
 * @param value String value from the environment, e.g. `process.env.MY_ENV_VAR`
 * @returns The parsed boolean value or `undefined` if the value is `undefined`
 */
export function parseBooleanEnvValue(
  value: string | undefined,
): boolean | undefined {
  if (value == undefined) {
    return undefined;
  }
  return value.toLowerCase() === "true";
}

/**
 * Tries to parse the given value into a boolean.
 * Returns the default value if the value is `undefined`.
 *
 * @param value String value from the environment, e.g. `process.env.MY_ENV_VAR`
 * @param defaultValue The default value to return if the value is `undefined`
 * @returns The parsed boolean value or the default value
 */
export function parseBooleanEnvValueWithDefault(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  const parsedValue = parseBooleanEnvValue(value);
  if (parsedValue == undefined) {
    return defaultValue;
  }
  return parsedValue;
}
