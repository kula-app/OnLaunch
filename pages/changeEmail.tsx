import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import { signOut, useSession } from "next-auth/react";
import validateEmailChange from "../api/tokens/validateEmailChange";
import Routes from "../routes/routes";
import CustomSnackbar from "../components/CustomSnackbar";
import { CircularProgress } from "@mui/material";

export default function ResetPasswordPage() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const loading = status === "loading";

  const { token } = router.query;

  const [emailChanged, setEmailChanged] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

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
          if (!String(error).includes("obsolete")) {
            setAlertMessage(`Error while request: ${error}`);
            setAlertSeverity("error");
            setShowAlert(true);
          }
        }
      };
      changeEmail();
    }
  }, [router.isReady, token, router, session, loading]);

  function navigateToAuthPage() {
    router.push(Routes.AUTH);
  }

  return (
    <>
      <main className={styles.main}>
        {!loading && !emailChanged && (
          <div>
            <h1 className="centeredElement">Invalid link</h1>
            <div>
              If you want to change your email address please restart the
              process
            </div>
          </div>
        )}
        {!loading && emailChanged && (
          <div className="centeredElement column">
            <h1 className="centeredElement">
              Your email address has been changed
            </h1>
            <div>please log in with your new email address</div>
            <Button
              variant="contained"
              color="info"
              sx={{ marginTop: 5 }}
              onClick={() => navigateToAuthPage()}
            >
              login
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
