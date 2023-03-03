import { useRouter } from "next/router";
import { getSession } from 'next-auth/react';
import { useEffect } from "react";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    navigateToDashboardPage();
  }, [router.isReady]);
  

  function navigateToDashboardPage() {
    router.push(`/dashboard`);
  }

  return (
    <>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      }
    }
  }

  return {
    props: { session },
  };
}