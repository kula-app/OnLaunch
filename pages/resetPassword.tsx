import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import Button from "@mui/material/Button";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import type { AlertColor } from '@mui/material/Alert';
import { getSession } from 'next-auth/react';

export default function VerifyPage() {
  const router = useRouter();

  const { token } = router.query;

  const RESET_TOKEN_API_URL = "/api/frontend/v0.1/tokens/resetPassword/";
  
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  useEffect(() => {
    if (!router.isReady) return;
    if (!!token) {
      tokenHandler();
    }

    function tokenHandler() {
    
      fetch(RESET_TOKEN_API_URL + token, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
      }).then((response) => {
          if(!response.ok) {
              return response.json().then(error => {
                  throw new Error(error.message);
              });
          }
  
          setLoading(false);
          setValidToken(true);
    
          return response.json();
      })
      .catch(error => {
          setLoading(false);
      }); 
    }
  }, [router.isReady, token]);
    
  function navigateToAuthPage() {
    router.push(`/auth`);
  }

  function sendNewPassword() {
    if (password === password2) {
      fetch(RESET_TOKEN_API_URL, {
        method: "PUT",
        body: JSON.stringify({ token: token, password: password }),
        headers: {
            "Content-Type": "application/json",
        },
      }).then((response) => {
          if(!response.ok) {
              return response.json().then(error => {
                  throw new Error(error.message);
              });
          }

          navigateToAuthPage();
    
          return response.json();
      })
      .catch(error => {
        setAlertMessage(`Error while sending request: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }); 
    } else {
      setAlertMessage('The passwords do not match!');
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
      <Navbar hasSession={false} />
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
              id="password2"
              type="password" 
              className="marginTopMedium"
              onChange={(event) => setPassword2(event.target.value)}
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