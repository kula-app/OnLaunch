import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import getPasswordResetToken from "../api/tokens/getPasswordResetToken";
import resetPassword from "../api/tokens/resetPassword";
import Routes from "../routes/routes";
import styles from "../styles/Home.module.css";

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
            <Heading className="text-center mb-8">Invalid link</Heading>
            <div>
              If you want to reset your password please restart the process
            </div>
          </div>
        )}
        {!loading && validToken && (
          <div style={{ width: 370 }}>
            <Heading className="text-center mb-8">
              Enter your new password
            </Heading>
            <FormControl className="mt-4">
              <FormLabel>Password</FormLabel>
              <Input
                required
                id="password"
                type="password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormControl>
            <FormControl className="mt-4">
              <FormLabel>Password (repeat)</FormLabel>
              <Input
                required
                id="passwordConfirmation"
                type="password"
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
              />
            </FormControl>
            <Center>
              <Button
                colorScheme="highlightPurple"
                className="mt-4"
                onClick={sendNewPassword}
              >
                change password
              </Button>
            </Center>
          </div>
        )}
        {loading && (
          <div>
            <Heading className="text-center mb-8">loading ...</Heading>
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
