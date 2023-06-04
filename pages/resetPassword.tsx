import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { getSession } from "next-auth/react";
import getPasswordResetToken from "../api/tokens/getPasswordResetToken";
import resetPassword from "../api/tokens/resetPassword";
import Routes from "../routes/routes";
import { Button, Spinner, Input, useToast } from "@chakra-ui/react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();

  const { token } = router.query;

  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (!!token) {
      const fetchEmailChangeToken = async () => {
        try {
          await getPasswordResetToken(token as string);

          setLoading(false);
          setValidToken(true);
        } catch (error) {
          setLoading(false);

          toast({
            title: "Error while fetching token!",
            description: `${error}`,
            status: "error",
            isClosable: true,
            duration: 6000,
          });
        }
      };

      fetchEmailChangeToken();
    }
  }, [router.isReady, token, toast]);

  function navigateToAuthPage() {
    router.push(Routes.AUTH);
  }

  async function sendNewPassword() {
    if (password === passwordConfirmation) {
      try {
        await resetPassword(token as string, password);

        navigateToAuthPage();
      } catch (error) {
        toast({
          title: "Error while sending request!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    } else {
      toast({
        title: "Error!",
        description: "The passwords do not match.",
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  return (
    <>
      <main className={styles.main}>
        {!loading && !validToken && (
          <div>
            <h1>Invalid link</h1>
            <div>
              If you want to reset your password please restart the process
            </div>
          </div>
        )}
        {!loading && validToken && (
          <div>
            <h1>Enter your new password</h1>
            <label>
              Password
              <Input
                required
                id="password"
                type="password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label>
              Password (repeat)
              <Input
                required
                id="passwordConfirmation"
                type="password"
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
              />
            </label>
            <Button
              color="info"
              sx={{ marginTop: 5 }}
              onClick={() => sendNewPassword()}
            >
              change password
            </Button>
          </div>
        )}
        {loading && (
          <div>
            <h1>loading ...</h1>
            <Spinner />
          </div>
        )}
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
