import Navbar from "@/components/Navbar";
import { ColorModeProvider } from "@/components/ui/color-mode";
import { Toaster } from "@/components/ui/toaster";
import { system } from "@/theme/theme";
import { ChakraProvider } from "@chakra-ui/react";
import "cal-sans";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "reflect-metadata";
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <SessionProvider session={session}>
          <Navbar session={session} />
          <Component {...pageProps} />
        </SessionProvider>
        <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  );
}
