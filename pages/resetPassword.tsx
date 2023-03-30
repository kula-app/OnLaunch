import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import styles from "../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import type { AlertColor } from '@mui/material/Alert';
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { getSession } from 'next-auth/react';
import getPasswordResetToken from "../api/getPasswordResetToken";
import resetPassword from "../api/resetPassword";
import Routes from "../routes/routes";

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
        await getPasswordResetToken(token as string);
        
        setLoading(false);
        setValidToken(true);
      } 
  
      try {
        fetchEmailChangeToken();
      } catch(error) {
        setLoading(false);

        setAlertMessage(`Error while fetching token: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
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
      } catch(error) {
        setAlertMessage(`Error while sending request: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } else {
      setAlertMessage('The passwords do not match!');
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
      <main className={styles.main}>
        {(!loading && !validToken) && <div>
          <h1 className="centeredElement">Invalid link</h1>
          <div>If you want to reset your password please restart the process</div>
        </div>
        }
        {(!loading && validToken) && <div className="centeredElement column">
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

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: { session },
  };
}