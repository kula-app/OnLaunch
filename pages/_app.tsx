import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar";
import "cal-sans";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

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
