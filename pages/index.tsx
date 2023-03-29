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
      {/* TODO: add a short message like 'Redirecting...', so in case something went wrong the page is not blank */}
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