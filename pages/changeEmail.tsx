import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import Button from "@mui/material/Button";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from '@mui/material/Alert';
import { useSession, signOut, getSession } from 'next-auth/react';

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const { data: session, status } = useSession()
  const loading = status === "loading"

  const { token } = router.query;

  const EMAIL_API_URL = "/api/frontend/v0.1/users/emailChange";
  
  const [emailChanged, setEmailChanged] = useState(false);


  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  useEffect(() => {
    if (!router.isReady) return;
    if (!!token && !loading) {
      tokenHandler();
    }

    function tokenHandler() {
    
      fetch(EMAIL_API_URL, {
        method: "PUT",
        body: JSON.stringify({ token: token }),
        headers: {
            "Content-Type": "application/json",
        },
      }).then((response) => {
          if(!response.ok) {
              return response.json().then(error => {
                  throw new Error(error.message);
              });
          }

          if (!!session) {
            signOut({
              redirect: false
            });
          }
  
          setEmailChanged(true);
    
          return response.json();
      })
      .catch(error => {
        if (!error.message.includes("obsolete")) {
          setAlertMessage(`Error while request: ${error.message}`);
          setAlertSeverity("error");
          setShowAlert(true);
        }
      }); 
    }
    
  }, [router.isReady, token, router, session, loading]);
    
  function navigateToAuthPage() {
    router.push(`/auth`);
  }

  return (
    <>
      <Navbar hasSession={!!session} />
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
