"use server";

import { PropsWithChildren } from "react";

export const ServerSideProviders: React.FC<
  PropsWithChildren<unknown>
> = async ({ children }) => {
  return <>{children}</>;
};
