export function ifEmptyThenUndefined(value?: string): string | undefined {
  return value?.length === 0 ? undefined : value;
}
