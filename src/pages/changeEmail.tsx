import { validateEmailChange } from "@/app/actions/validate-email-change";
import { ServerError } from "@/errors/server-error";
import { Button, Center, Heading, Spinner, useToast } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Routes from "../routes/routes";
import styles from "../styles/Home.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const { data: session, status } = useSession();
  const loading = status === "loading";

  const { token } = router.query;

  const [emailChanged, setEmailChanged] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!!token && !loading) {
      const changeEmail = async () => {
        try {
          const response = await validateEmailChange({
            token: token as string,
          });
          if (!response.success) {
            throw new ServerError(response.error.name, response.error.message);
          }
          if (!!session) {
            signOut({
              redirect: false,
            });
          }
          setEmailChanged(true);
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
      changeEmail();
    }
  }, [router.isReady, token, router, session, loading, toast]);

  function navigateToAuthPage() {
    router.push(Routes.login());
  }

  return (
    <>
      <main className={styles.main}>
        {!loading && !emailChanged && (
          <div>
            <Heading className="text-center">Invalid link</Heading>
            <div className="mt-8">
              If you want to change your email address please restart the
              process
            </div>
          </div>
        )}
        {true && (
          <div>
            <Heading className="text-center">
              Your email address has been changed
            </Heading>
            <Center>
              <div className="mt-8">
                Please log in with your new email address
              </div>
            </Center>
            <Center>
              <Button
                colorScheme="blue"
                sx={{ marginTop: 5 }}
                onClick={navigateToAuthPage}
              >
                login
              </Button>
            </Center>
          </div>
        )}
        {loading && (
          <div>
            <Heading className="text-center">loading ...</Heading>
            <Spinner />
          </div>
        )}
      </main>
    </>
  );
}
