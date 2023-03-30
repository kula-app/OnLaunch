import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import styles from "../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import type { AlertColor } from '@mui/material/Alert';
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import { signOut, useSession } from 'next-auth/react';
import validateEmailChange from "../api/validateEmailChange";
import Routes from "../routes/routes";

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const { data: session, status } = useSession()
  const loading = status === "loading"

  const { token } = router.query;
  
  const [emailChanged, setEmailChanged] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  useEffect(() => {
    if (!router.isReady) return;
    if (!!token && !loading) {
      try {
        async () => {
          await validateEmailChange(token as string);
        }

        if (!!session) {
          signOut({
            redirect: false
          });
        }
  
        setEmailChanged(true);
      } catch(error) {
        if (!(error as string).includes("obsolete")) {
          setAlertMessage(`Error while request: ${error}`);
          setAlertSeverity("error");
          setShowAlert(true);
        }
      }; 
    }
    
  }, [router.isReady, token, router, session, loading]);
    
  function navigateToAuthPage() {
    router.push(Routes.AUTH);
  }

  return (
    <>
      <main className={styles.main}>
        {(!loading && !emailChanged) && <div>
          <h1 className="centeredElement">Invalid link</h1>
          <div>If you want to change your email address please restart the process</div>
        </div>
        }
        {(!loading && emailChanged) && <div className="centeredElement column">
          <h1 className="centeredElement">Your email address has been changed</h1>
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
        }
        {(loading) && <div>
          <h1>loading ...</h1>
        </div>
        }
      </main>
      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        >
        <Alert
          severity={alertSeverity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setShowAlert(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
