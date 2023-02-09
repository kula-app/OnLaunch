import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import type { AlertColor } from '@mui/material/Alert';

interface App {
  name: string;
}

export default function NewAppPage() {
  const router = useRouter();

  const APPS_API_URL = "/api/frontend/v0.1/apps/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");


  const nameInputRef = useRef<HTMLInputElement>(null);

  function navigateToAppsPage() {
    router.push(`/`);
  } 

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let app: App = {
        name: nameInputRef.current!.value,
    };

    // make POST http request
    fetch(APPS_API_URL, {
        method: "POST",
        body: JSON.stringify(app),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }

        setAlertMessage("App created successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        resetForm(); 
        navigateToAppsPage();
  
        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while creating new app: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });  
       
  }

  function resetForm() {
    (document.getElementById("appForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <Navbar />
        <main className={styles.main}>
          <h1>New App</h1>
          <form id="appForm" onSubmit={submitHandler} className="column">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" ref={nameInputRef} />
            <Button variant="contained" type="submit">
              save
            </Button>
          </form>
          {showAlert && (
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
          )}
        </main>
      </div>
    </>
  );
}
