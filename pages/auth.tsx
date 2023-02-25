import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

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

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: { session },
  };
}