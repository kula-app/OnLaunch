import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "cal-sans";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "reflect-metadata";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

const chakraTheme = extendTheme();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ChakraProvider theme={chakraTheme} resetCSS>
      <SessionProvider session={session}>
        <Navbar session={session} />
        <Component {...pageProps} />
      </SessionProvider>
    </ChakraProvider>
  );
}
