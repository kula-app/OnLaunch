import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import { useSession, getSession } from 'next-auth/react';

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from '@mui/material/Alert';

export default function ProfilePage() {
  const router = useRouter();
  
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const USERS_API_URL = "/api/frontend/v0.1/users/";
  
  const [verified, setVerified] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  

  useEffect(() => {
    if (!router.isReady) return;

    fetch(MESSAGES_API_URL + messageId)
    .then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        return response.json();
    })
    .then((data) => {
        let msg: Message = {
        id: data.id,
        title: data.title,
        body: data.body,
        blocking: data.blocking,
        startDate: data.startDate,
        endDate: data.endDate,
        appId: data.appId,
        actions: data.actions,
        };

        fillForm(msg);
    })
    .catch(error => {
        setAlertMessage(`Error while fetching message: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });
  }, [router.isReady]);











  useEffect(() => {
    if (!router.isReady) return;
    if (!!token) {
      submitHandler();
    }

  }, [router.isReady]);
  
  function submitHandler() {
    
    fetch(TOKEN_API_URL, {
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
        setAlertMessage(`Error while verifying: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }); 
  }
    
  function navigateToAuthPage() {
    router.push(`/auth`);
  }

  return (
    <>
      <Navbar hasSession={!!session} />
      <main className={styles.main}>
        <h1>Welcome back, {session?.user?.firstName}!</h1>
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

  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      }
    }
  }

  return {
    props: { session },
  };
}