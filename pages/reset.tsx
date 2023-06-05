import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../styles/Home.module.css";
import createPasswordResetToken from "../api/tokens/createPasswordResetToken";
import Routes from "../routes/routes";
import { Input, Button, useToast, Text } from "@chakra-ui/react";

export default function ResetPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [sentMail, setSentMail] = useState(false);

  function navigateToAuthPage() {
    router.replace(Routes.AUTH);
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createPasswordResetToken(email);

      setSentMail(true);
    } catch (error) {
      toast({
        title: "Error while sending request!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  return (
    <>
      <main className={styles.main}>
        {!sentMail && (
          <h1 className="text-3xl font-bold text-center mb-8">
            Enter your mail address for password reset
          </h1>
        )}
        {!sentMail && (
          <form onSubmit={submitHandler}>
            <label>
              <Text as="b">Email</Text>
              <Input
                className="mt-2"
                required
                id="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <div className="flex flex-col">
              <Button className="mt-4" colorScheme="blue" type="submit">
                reset password
              </Button>
              <Button
                variant="ghost"
                colorScheme="blue"
                type="button"
                onClick={() => navigateToAuthPage()}
              >
                go back to login
              </Button>
            </div>
          </form>
        )}
        {sentMail && (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8">Check your mails</h1>
            <div>
              You should receive a mail within the next minutes with the reset
              link!
            </div>
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
