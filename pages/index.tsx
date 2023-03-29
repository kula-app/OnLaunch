import { useRouter } from "next/router";
import { getSession } from 'next-auth/react';
import { useEffect } from "react";
import Routes from "../routes/routes";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    function navigateToDashboardPage() {
      router.push(Routes.DASHBOARD);
    }

    navigateToDashboardPage();
  }, [router.isReady, router]);

  return (
    <>
      <h1>redirecting ...</h1>
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