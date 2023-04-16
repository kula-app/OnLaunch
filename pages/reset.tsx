import Button from "@mui/material/Button";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import createPasswordResetToken from "../api/tokens/createPasswordResetToken";
import Routes from "../routes/routes";
import CustomSnackbar from "../components/CustomSnackbar";

export default function ResetPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sentMail, setSentMail] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  function navigateToAuthPage() {
    router.replace(Routes.AUTH);
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createPasswordResetToken(email);

      setSentMail(true);
    } catch (error) {
      setAlertMessage(`Error while sending request: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
      <main className={styles.main}>
        {!sentMail && <h1>Enter your mail address for password reset</h1>}
        {!sentMail && (
          <form className="column" onSubmit={submitHandler}>
            <TextField
              required
              label="Email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              variant="contained"
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
        <CustomSnackbar
          message={alertMessage}
          severity={alertSeverity}
          isOpenState={[showAlert, setShowAlert]}
        />
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
