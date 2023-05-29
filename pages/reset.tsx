import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../styles/Home.module.css";
import createPasswordResetToken from "../api/tokens/createPasswordResetToken";
import Routes from "../routes/routes";
import { Input, Button, useToast } from "@chakra-ui/react";

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
        {!sentMail && <h1>Enter your mail address for password reset</h1>}
        {!sentMail && (
          <form className="column" onSubmit={submitHandler}>
            <label>
              Email
              <Input
                required
                id="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <Button
              type="submit"
              className="marginTopMedium"
            >
              reset password
            </Button>
            <Button
              variant="text"
              type="button"
              className="marginTopMedium"
              onClick={() => navigateToAuthPage()}
            >
              go back to login
            </Button>
          </form>
        )}
        {sentMail && (
          <div>
            <h1 className="centeredElement">Check your mails</h1>
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
