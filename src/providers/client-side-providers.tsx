"use client";

import { ColorModeProvider } from "@/components/ui/color-mode";
import { Toaster } from "@/components/ui/toaster";
import { system } from "@/theme/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

export const ClientSideProviders: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  );
};
