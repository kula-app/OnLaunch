import { Button, Heading, Spinner, useToast } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import createVerifyToken from "../api/tokens/createVerifyToken";
import updateVerifiedStatus from "../api/tokens/updateVerifiedStatus";
import Routes from "../routes/routes";
import styles from "../styles/Home.module.css";

export default function VerifyPage() {
  const router = useRouter();
  const toast = useToast();

  const { signup, token, email } = router.query;

  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [obsolete, setObsolete] = useState(false);
  const [disabled, setDisabled] = useState(false);

  function navigateToAuthPage() {
    router.push(Routes.AUTH);
  }

  useEffect(() => {
    if (!router.isReady) return;

    async function verifyUser() {
      try {
        await updateVerifiedStatus(token as string);

        setVerified(true);

        toast({
          title: "Sucess!",
          description:
            "Thank you for verifying your account. You may login now",
          status: "success",
          isClosable: true,
          duration: 6000,
        });
      } catch (error) {
        if (String(error).includes("already verified")) {
          toast({
            title: "Error while verifying!",
            description: `You are already verified`,
            status: "error",
            isClosable: true,
            duration: 6000,
          });
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
            <Heading className="text-center">Verify your account</Heading>
            <div className="mt-8">
              Please check your mails for the verification link!
            </div>
          </div>
        )}
        {verified && !expired && (
          <div>
            <Heading className="text-center">Thank you for verifying!</Heading>
            <div className="mt-8">
              If you want to use the full functionality of OnLaunch please log
              in
            </div>
            <Button
              colorScheme="blue"
              sx={{ marginTop: 5 }}
              onClick={navigateToAuthPage}
            >
              login
            </Button>
          </div>
        )}
        {!signup && !verified && (expired || obsolete) && (
          <div>
            <Heading className="text-center">
              Link is {expired ? "expired" : "obsolete"}!
            </Heading>
            <div className="mt-8">No worries, we can send you a new one </div>
          </div>
        )}
        {!verified && !signup && !expired && !obsolete && !email && (
          <div>
            <Heading className="text-center">loading ...</Heading>
            <Spinner />
          </div>
        )}
        {!signup &&
          !verified &&
          (!!email || !!expired || !!obsolete) &&
          !disabled && (
            <Button colorScheme="blue" type="button" onClick={resendLink}>
              resend link
            </Button>
          )}
        {!signup && !verified && !!email && disabled && (
          <Button
            colorScheme="blue"
            type="button"
            disabled
            onClick={resendLink}
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
