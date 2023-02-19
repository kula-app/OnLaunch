import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { useSession } from 'next-auth/react';

export default function Auth() {
  
    const { data: session, status } = useSession();
    const loading = status === "loading";

  return (
    <>
      <Navbar hasSession={session ? true : false} />
      <AuthForm />
    </>
  );
}
