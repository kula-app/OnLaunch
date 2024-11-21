"use server";

export type ExcludeNestedIds<T> = T extends Date
  ? T
  : T extends Array<infer U>
    ? ExcludeNestedIds<U>[]
    : T extends object
      ? Omit<
          {
            [K in keyof T]: ExcludeNestedIds<T[K]>;
          },
          "id"
        >
      : T;
