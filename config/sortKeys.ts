export function sortKeys<T extends { [keyof: string]: unknown }>(obj: T): T {
  return Object.keys(obj as any)
    .sort()
    .reduce((acc: { [keyof: string]: unknown }, key) => {
      acc[key] = obj[key];
      return acc;
    }, {}) as T;
}
