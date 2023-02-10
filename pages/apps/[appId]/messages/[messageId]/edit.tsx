import Moment from "moment";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useRef, useState } from "react";
import Navbar from "../../../../../components/Navbar";
import styles from "../../../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Switch from "@mui/material/Switch";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from "@mui/material/Snackbar";
import { SelectChangeEvent } from "@mui/material";
import type { AlertColor } from '@mui/material/Alert';

enum ActionType {
  Button = "BUTTON",
  DismissButton = "DISMISS_BUTTON",
}

type Action = {
  actionType: ActionType;
  title: string;
};

interface Message {
  endDate: string;
  startDate: string;
  blocking: boolean;
  body: string;
  title: string;
  id: number;
  appId: number;
  actions: Action[];
}

export default function EditMessageOfAppPage() {
  const router = useRouter();

  const MESSAGES_API_URL = "/api/frontend/v0.1/messages/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  const [actions, setActions] = useState<Action[]>([]);

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
      actions: actions,
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
    setActions(msg.actions);
  }

  
  function addAction() {
    setActions(oldActions => [...oldActions, { actionType: ActionType.Button, title: "" }]);
  }

  function deleteAction(index: number) {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  }

  function getActionTypeFromValue(value: string) {
    switch(value) {
      case "DISMISS_BUTTON":
        return "DismissButton";
    }
    return "Button";
  }

  function handleActionTitleChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    let data = [...actions];
    data[index]["title"] = event.target.value;
    setActions(data);
  }

  function handleActionTypeChange(index: number, event: SelectChangeEvent<unknown>) {
    let data = [...actions];
    data[index]["actionType"] = ActionType[getActionTypeFromValue(event.target.value as string)];
    setActions(data);
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
            <h3 className="centeredElement">Actions</h3>
            <Table
              sx={{ minWidth: 650, maxWidth: 1300 }}
              aria-label="simple table"
              className="messageTable"
              >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Title</strong>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions && actions.map((action: Action, index: number) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Select 
                          label="ActionType"
                          value={action.actionType}
                          onChange={event => handleActionTypeChange(index, event)}
                        >
                          {Object.values(ActionType).map((value, index) => {
                            return (
                              <MenuItem key={index} value={value}>{value}</MenuItem>
                            )
                          })}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <input type="text" 
                          name="actionTitle" 
                          value={action.title} 
                          onChange={event => handleActionTitleChange(index, event)}
                          />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => deleteAction(index)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {actions.length == 0 && (
              <p className="marginTopMedium centeredElement">no actions added</p>
            )}
            <div className="addButton centeredElement">
              <Button
                variant="contained"
                onClick={() => {
                  addAction();
                }}
              >
                New Action
                </Button>
            </div>
            <Button variant="contained" type="submit">
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
