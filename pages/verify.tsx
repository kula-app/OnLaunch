import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { getSession } from "next-auth/react";
import updateVerifiedStatus from "../api/tokens/updateVerifiedStatus";
import Routes from "../routes/routes";
import { useCallback } from "react";
import createVerifyToken from "../api/tokens/createVerifyToken";
import { Button, useToast, Spinner } from "@chakra-ui/react";

export default function VerifyPage() {
  const router = useRouter();
  const toast = useToast();

  const { signup, token, email } = router.query;

  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [obsolete, setObsolete] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const navigateToAuthPage = useCallback(() => {
    router.push(Routes.AUTH);
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;

    async function verifyUser() {
      try {
        await updateVerifiedStatus(token as string);

        setVerified(true);
      } catch (error) {
        if (String(error).includes("already verified")) {
          // if user already verified, go to auth page
          navigateToAuthPage();
        } else if (String(error).includes("expired")) {
          setExpired(true);
        } else if (String(error).includes("obsolete")) {
          setObsolete(true);
        } else {
          toast({
            title: "Error while verifying!",
            description: `${error}`,
            status: "error",
            isClosable: true,
            duration: 6000,
          });
        }
      }
    }

    if (!!token) {
      verifyUser();
    }
  }, [router.isReady, token, signup, navigateToAuthPage, toast]);

  async function resendLink() {
    try {
      await createVerifyToken(email as string);

      toast({
        title: "Success!",
        description: "Link was resend.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Error while resending link!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }

    setDisabled(true);
  }

  return (
    <>
      <main className={styles.main}>
        {(signup || email) && !expired && (
          <div>
            <h1>Verify your account</h1>
            <div>Please check your mails for the verification link!</div>
          </div>
        )}
        {verified && !expired && (
          <div>
            <h1>Thank you for verifying!</h1>
            <div>
              If you want to use the full functionality of OnLaunch please log
              in
            </div>
            <Button
              color="info"
              sx={{ marginTop: 5 }}
              onClick={() => navigateToAuthPage()}
            >
              login
            </Button>
          </div>
        )}
        {!signup && !verified && (expired || obsolete) && (
          <div>
            <h1>
              Link is {expired ? "expired" : "obsolete"}!
            </h1>
            <div>No worries, we can send you a new one </div>
          </div>
        )}
        {!verified && !signup && !expired && !obsolete && !email && (
          <div>
            <h1>loading ...</h1>
            <Spinner />
          </div>
        )}
        {!signup &&
          !verified &&
          (!!email || !!expired || !!obsolete) &&
          !disabled && (
            <Button
              type="button"
              onClick={() => resendLink()}
            >
              resend link
            </Button>
          )}
        {!signup && !verified && !!email && disabled && (
          <Button
            type="button"
            disabled
            onClick={() => resendLink()}
          >
            resend link
          </Button>
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
