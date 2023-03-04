import Navbar from "../components/Navbar";
import { getSession, useSession } from 'next-auth/react';
import styles from "../styles/Home.module.css";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useState, FormEvent } from 'react';

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from '@mui/material/Alert';

const PASSWORD_TOKEN_API_URL = "/api/frontend/v0.1/tokens/resetPassword/";

async function passwordResetRequest(email: string) {
  const response = await fetch(PASSWORD_TOKEN_API_URL, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
          'Content-Type':  'application/json'
      }
  });

  const data = await response.json();

  if (!response.ok) {
      throw new Error (data.message || 'an error occurred');
  }

  return data;
}

export default function ResetPage() {
  const { data: session } = useSession();

  const router = useRouter();
  
  const[email, setEmail] = useState("");
  const [sentMail, setSentMail] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  function navigateToAuthPage() {
    router.replace(`/auth`);
  } 
  
  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
        const result = await passwordResetRequest(email);
        
        setSentMail(true);
    } catch (error) {
        setAlertMessage(`Error while sending request: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }
  }

  return (
    <>
      <Navbar hasSession={!!session} />
      <main className={styles.main}>
        {!sentMail && <h1>Enter your mail address for password reset</h1>}
        {!sentMail && 
        <form
          className="column"
          onSubmit={submitHandler}
        >
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
        }
        {(sentMail) && <div>
          <h1 className="centeredElement">Check your mails</h1>
          <div>You should receive a mail within the next minutes with the reset link!</div>
        </div>
        }
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
      </main>
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