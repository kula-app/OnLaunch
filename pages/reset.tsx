import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
} from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import createPasswordResetToken from "../api/tokens/createPasswordResetToken";
import Routes from "../routes/routes";
import styles from "../styles/Home.module.css";

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
          <Heading className="text-center mb-8">
            Enter your mail address for password reset
          </Heading>
        )}
        {!sentMail && (
          <form onSubmit={submitHandler}>
            <FormControl className="mt-4">
              <FormLabel>Email</FormLabel>
              <Input
                required
                id="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormControl>
            <div className="flex flex-col">
              <Button
                className="mt-4"
                colorScheme="highlightPurple"
                type="submit"
              >
                reset password
              </Button>
              <Button
                variant="ghost"
                colorScheme="highlightPurple"
                type="button"
                onClick={navigateToAuthPage}
              >
                go back to login
              </Button>
            </div>
          </form>
        )}
        {sentMail && (
          <div>
            <Heading className="text-center mb-8">Check your mails</Heading>
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
