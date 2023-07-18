import { Button, Heading, Spinner, Stack, useToast } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import saveSubscription from "../api/stripe/saveSubscription";
import Routes from "../routes/routes";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);

  let { session_id: sessionId, org_name: orgName, canceled } = router.query;

  if (!orgName) {
    orgName = "new organisation";
  }

  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  }

  function navigateToNewOrgPage() {
    router.push(Routes.createNewOrg);
  }

  useEffect(() => {
    if (!router.isReady) return;

    if (!sessionId) {
      navigateToDashboardPage();
    }

    if (!!sessionId && !canceled) {
      const getCustomer = async () => {
        try {
          await saveSubscription(sessionId as string, orgName as string);
        } catch (error) {
          toast({
            title: "Error while request!",
            description: `${error}`,
            status: "error",
            isClosable: true,
            duration: 6000,
          });
        }
      };
      getCustomer();
    }
    setLoading(false);
  }, [router.isReady, router, sessionId, toast, canceled]);

  return (
    <>
      <main className={styles.main}>
        {!loading && !canceled && (
          <div>
            <Heading className="text-center mt-4">Success!</Heading>
            <p>
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
            <p className="mt-8">
              Neither your subscription nor your organisation were created!
            </p>
            <Stack>
              <Button
                onClick={navigateToDashboardPage}
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
                try again
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
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
