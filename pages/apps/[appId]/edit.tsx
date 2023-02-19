import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import styles from "../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import type { AlertColor } from '@mui/material/Alert';
import { useSession } from 'next-auth/react';

interface App {
  name: string;
  id: number;
}

export default function EditAppPage() {
  const router = useRouter();
  
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const APPS_API_URL = "/api/frontend/v0.1/apps/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const[appName, setAppName] = useState("");

  const { appId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    fetch(APPS_API_URL + appId)
    .then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        return response.json();
    })
    .then((data) => {
        let app: App = {
        id: data.id,
        name: data.name,
        };

        fillForm(app);
    })
    .catch(error => {
        setAlertMessage(`Error while fetching message: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });
  }, [router.isReady]);

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let newApp: App = {
      id: Number(router.query.appId),
      name: appName,
    };

    // make PUT http request
    fetch(APPS_API_URL + appId, {
    method: "PUT",
    body: JSON.stringify(newApp),
    headers: {
        "Content-Type": "application/json",
    },
    }).then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }

        setAlertMessage("App edited successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        navigateToAppsPage();
  
        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while editing app: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }); 

  }
  
  function navigateToAppsPage() {
    router.push(`/`);
  } 

  function fillForm(app: App) {

    // fill the form
    setAppName(app.name);
  }

  return (
    <>
      <div>
        <Navbar hasSession={session ? true : false} />
        <main className={styles.main}>
          <h1>Edit App</h1>
          <form 
            id="appForm" 
            onSubmit={submitHandler} 
            className="column"
          >
            <TextField 
              required 
              label="Name"
              id="name" 
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
            />
            <Button 
              variant="contained" 
              type="submit"
              className="marginTopMedium"
            >
              update
            </Button>
          </form>
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
      </div>
    </>
  );
}
