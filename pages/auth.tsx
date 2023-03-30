import { getSession } from 'next-auth/react';
import AuthForm from "../components/AuthForm";

export default function Auth() {

  return (
    <>
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