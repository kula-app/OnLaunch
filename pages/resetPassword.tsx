import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import { getSession } from "next-auth/react";
import getPasswordResetToken from "../api/tokens/getPasswordResetToken";
import resetPassword from "../api/tokens/resetPassword";
import Routes from "../routes/routes";
import CustomSnackbar from "../components/CustomSnackbar";
import { CircularProgress } from "@mui/material";

export default function ResetPasswordPage() {
  const router = useRouter();

  const { token } = router.query;

  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

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

          setAlertMessage(`Error while fetching token: ${error}`);
          setAlertSeverity("error");
          setShowAlert(true);
        }
      };

      fetchEmailChangeToken();
    }
  }, [router.isReady, token]);

  function navigateToAuthPage() {
    router.push(Routes.AUTH);
  }

  async function sendNewPassword() {
    if (password === passwordConfirmation) {
      try {
        await resetPassword(token as string, password);

        navigateToAuthPage();
      } catch (error) {
        setAlertMessage(`Error while sending request: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } else {
      setAlertMessage("The passwords do not match!");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
      <main className={styles.main}>
        {!loading && !validToken && (
          <div>
            <h1 className="centeredElement">Invalid link</h1>
            <div>
              If you want to reset your password please restart the process
            </div>
          </div>
        )}
        {!loading && validToken && (
          <div className="centeredElement column">
            <h1 className="centeredElement">Enter your new password</h1>
            <TextField
              required
              label="Password"
              id="password"
              type="password"
              className="marginTopMedium"
              onChange={(event) => setPassword(event.target.value)}
            />
            <TextField
              required
              label="Password (repeat)"
              id="passwordConfirmation"
              type="password"
              className="marginTopMedium"
              onChange={(event) => setPasswordConfirmation(event.target.value)}
            />
            <Button
              variant="contained"
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
            <CircularProgress />
          </div>
        )}
      </main>
      <CustomSnackbar
        message={alertMessage}
        severity={alertSeverity}
        isOpenState={[showAlert, setShowAlert]}
      />
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
