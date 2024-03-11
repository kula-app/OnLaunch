import { ChakraProvider } from "@chakra-ui/react";
import "cal-sans";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import customTheme from "../styles/customChakraTheme";
import "../styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ChakraProvider theme={customTheme} resetCSS>
      <SessionProvider session={session}>
        <Navbar session={session} />
        <Component {...pageProps} />
      </SessionProvider>
    </ChakraProvider>
  );
}
