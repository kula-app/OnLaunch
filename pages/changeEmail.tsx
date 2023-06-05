import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { signOut, useSession } from "next-auth/react";
import validateEmailChange from "../api/tokens/validateEmailChange";
import Routes from "../routes/routes";
import { Button, Spinner, useToast } from "@chakra-ui/react";

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
          await validateEmailChange(token as string);
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
    router.push(Routes.AUTH);
  }

  return (
    <>
      <main className={styles.main}>
        {!loading && !emailChanged && (
          <div>
            <h1 className="text-3xl font-bold text-center">Invalid link</h1>
            <div className="mt-8">
              If you want to change your email address please restart the
              process
            </div>
          </div>
        )}
        {!loading && emailChanged && (
          <div>
            <h1 className="text-3xl font-bold text-center">
              Your email address has been changed
            </h1>
          <div className="flex flex-col justify-center">
            <div className="mt-8">
              please log in with your new email address
            </div>
              <Button
                colorScheme="blue"
                sx={{ marginTop: 5 }}
                onClick={() => navigateToAuthPage()}
              >
                login
              </Button>
            </div>
          </div>
        )}
        {loading && (
          <div>
            <h1 className="text-3xl font-bold text-center">loading ...</h1>
            <Spinner />
          </div>
        )}
      </main>
    </>
  );
}
