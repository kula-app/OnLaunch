import { Heading } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
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
      <Heading className="text-center">redirecting ...</Heading>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: Routes.login({
          redirect: context.req.url,
        }),
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
