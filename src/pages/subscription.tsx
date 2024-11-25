import { loadClientConfig } from "@/config/loadClientConfig";
import { Button, Heading, Spinner, Stack, useToast } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Routes from "../routes/routes";
import styles from "../styles/Home.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const stripeConfig = loadClientConfig().stripeConfig;

  const [loading, setLoading] = useState(true);

  let { success, canceled, orgId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    function navigateToDashboardPage() {
      router.push(Routes.dashboard);
    }

    if (!stripeConfig.isEnabled) {
      navigateToDashboardPage();
    }
  }, [router.isReady, router, stripeConfig.isEnabled]);

  function navigateToDashboardPage() {
    router.push(Routes.dashboard);
  }

  function navigateToNewOrgPage() {
    router.push(Routes.createOrg);
  }

  useEffect(() => {
    function navigateToOrgDetailsPage(id: number) {
      router.push(Routes.getOrgAppsByOrgId(id));
    }

    if (!router.isReady) return;

    if (success && orgId) {
      toast({
        title: "Success!",
        description: "Enjoy your new abo!",
        status: "success",
        isClosable: true,
        duration: 6000,
      });
      navigateToOrgDetailsPage(orgId as unknown as number);
    }

    setLoading(false);
  }, [router.isReady, router, toast, canceled, orgId, success]);

  return (
    <>
      <main className={styles.main}>
        {!loading && !canceled && (
          <div>
            <Heading className="text-center mt-4">Success!</Heading>
            <p className="text-center">
              Your subscription was successful and your new organisation was
              created!
            </p>
            <Stack>
              <Button
                onClick={() => navigateToDashboardPage()}
                colorScheme="blue"
                className="mt-8"
              >
                go to dashboard
              </Button>
              <Button
                onClick={navigateToNewOrgPage}
                colorScheme="blue"
                className="mt-2"
              >
                create another
              </Button>
            </Stack>
          </div>
        )}
        {loading && (
          <div>
            <Heading className="text-center mt-4">loading ...</Heading>
            <Spinner />
          </div>
        )}
        {!loading && canceled && (
          <div>
            <Heading className="text-center mt-4">Checkout canceled!</Heading>
            <p className="mt-8 text-center">
              Your subscription was not created!
            </p>
            <Stack>
              <Button
                onClick={navigateToDashboardPage}
                colorScheme="blue"
                className="mt-8"
              >
                go to dashboard
              </Button>
            </Stack>
          </div>
        )}
      </main>
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
