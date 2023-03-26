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
import { getSession } from 'next-auth/react';
import { useCallback } from 'react';

export default function VerifyPage() {
  const router = useRouter();

  const { signup, token, email } = router.query;

  const VERIFICATION_TOKEN_API_URL = "/api/frontend/v0.1/tokens/verification/";
  
  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [obsolete, setObsolete] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  const navigateToAuthPage = useCallback(() => {
    router.push(`/auth`);
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!!token && !signup) {
      fetch(VERIFICATION_TOKEN_API_URL, {
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
  
          setVerified(true);
    
          return response.json();
      })
      .catch(error => {
        if (error.message.includes('expired')) {
          setExpired(true);
        } else if (error.message.includes('obsolete')) {
          setObsolete(true);
        } else if (error.message.includes('already verified')) {
          navigateToAuthPage();
        } else {
          setAlertMessage(`Error while verifying: ${error.message}`);
          setAlertSeverity("error");
          setShowAlert(true);
        }
      }); 
    }

  }, [router.isReady, token, signup, email, navigateToAuthPage]);
    
  function resendLink() {
    fetch(VERIFICATION_TOKEN_API_URL, {
      method: "POST",
      body: JSON.stringify({ email: email }),
      headers: {
          "Content-Type": "application/json",
      },
    }).then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }

        setAlertMessage(`Link was successfully resend!`);
        setAlertSeverity("success");
        setShowAlert(true);
  
        return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while resending link: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }); 

    setDisabled(true);
  }

  return (
    <>
      <Navbar hasSession={false} />
      <main className={styles.main}>
        {((signup || email) && !expired) && <div>
          <h1 className="centeredElement">Verify your account</h1>
          <div>Please check your mails for the verification link!</div>
        </div>
        }
        {(verified && !expired) && <div className="centeredElement column">
          <h1 className="centeredElement">Thank you for verifying!</h1>
          <div>If you want to use the full functionality of OnLaunch please log in</div>
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
        {(!signup && !verified && expired && !obsolete) && <div className="centeredElement column">
          <h1 className="centeredElement">Link is expired!</h1>
          <div>No worries, we already sent you a new one
          </div>
        </div>
        }
        {(!signup && !verified && !expired && obsolete) && <div className="centeredElement column">
          <h1 className="centeredElement">Link is obsolete!</h1>
          <div>You already received a more recent link from us per mail
          </div>
        </div>
        }
        {(!verified && !signup && !expired && !obsolete && !email) && <div>
          <h1>loading ...</h1>
        </div> 
        }
        {(!signup && !verified && !!email && !disabled) && 
          <Button 
            variant="contained" 
            type="button"
            className="marginTopMedium"
            onClick={() => resendLink()}
            >
              resend link
          </Button>
        }
        {(!signup && !verified && !!email && disabled) && 
          <Button 
            variant="contained" 
            type="button"
            className="marginTopMedium"
            disabled
            onClick={() => resendLink()}
            >
              resend link
          </Button>
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