import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import Navbar from '../components/Navbar'

// TODO: is this a component, a wrapper, a provider? Might be a good idea to move it to a non-page file (if possible).

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Navbar hasSession={!!session} />
      <Component {...pageProps} />
    </SessionProvider>
  )
}
