"use client";

import { theme } from "@/theme/theme";
import { Steps, ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

export const ClientSideProviders: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <ChakraProvider value={theme}>
      <SessionProvider>{children}</SessionProvider>
    </ChakraProvider>
  );
};
