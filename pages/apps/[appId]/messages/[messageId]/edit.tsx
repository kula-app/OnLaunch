import Moment from "moment";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";
import Navbar from "../../../../../components/Navbar";
import styles from "../../../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import type { AlertColor } from '@mui/material/Alert';

interface Message {
  endDate: string;
  startDate: string;
  blocking: boolean;
  body: string;
  title: string;
  id: number;
  appId: number;
}

export default function MessagesOfAppPage() {
  const router = useRouter();

  const MESSAGES_API_URL = "/api/frontend/v0.1/messages/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [switchValue, setSwitchValue] = useState(false);
  const { appId } = router.query;
  const { messageId } = router.query;

  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

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
        };

        fillForm(msg);
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
    let message: Message = {
      id: Number(router.query.messageId),
      title: titleInputRef.current!.value,
      body: bodyInputRef.current!.value,
      blocking: switchValue,
      startDate: startInputRef.current!.value,
      endDate: endInputRef.current!.value,
      appId: Number(router.query.appId),
    };

    // make PUT http request
    fetch(MESSAGES_API_URL + messageId, {
    method: "PUT",
    body: JSON.stringify(message),
    headers: {
        "Content-Type": "application/json",
    },
    }).then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }

        setAlertMessage("Message edited successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        navigateToAppMessagesPage();
  
        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while editing message: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }); 

  }
  
  function navigateToAppMessagesPage() {
    router.push(`/apps/${router.query.appId}/messages/`);
  } 

  function fillForm(msg: Message) {

    // fill the form
    titleInputRef.current!.value = msg.title;
    bodyInputRef.current!.value = msg.body;
    setSwitchValue(msg.blocking);
    startInputRef.current!.value = Moment(msg.startDate).format(
      "YYYY-MM-DDTHH:mm:ss"
    );
    endInputRef.current!.value = Moment(msg.endDate).format(
      "YYYY-MM-DDTHH:mm:ss"
    );
  }

  return (
    <>
      <div>
        <Navbar />
        <main className={styles.main}>
          <h1>Edit Message</h1>
          <form id="messageForm" onSubmit={submitHandler} className="column">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" name="title" ref={titleInputRef} />
            <label htmlFor="body">Body</label>
            <textarea id="body" name="body" ref={bodyInputRef} rows={10} />
            <label htmlFor="blocking">Blocking</label>
            <Switch
              checked={switchValue}
              onChange={() => setSwitchValue(!switchValue)}
            ></Switch>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              ref={startInputRef}
            />
            <label htmlFor="endDate">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              ref={endInputRef}
            />
            <Button variant="contained" type="submit">
              update
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
