import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import Navbar from "../../../../components/Navbar";
import styles from "../../../../styles/Home.module.css";

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
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
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
  id?: number;
  appId: number;
  actions?: Action[];
}

export default function NewMessageForAppPage() {
  const router = useRouter();

  const MESSAGES_API_URL = "/api/frontend/v0.1/messages/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [actions, setActions] = useState<Action[]>([]);

  const [switchValue, setSwitchValue] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function navigateToAppMessagesPage() {
    router.push(`/apps/${router.query.appId}/messages/`);
  } 

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let message: Message = {
        title: title,
        body: body,
        blocking: switchValue,
        startDate: startDate,
        endDate: endDate,
        appId: Number(router.query.appId),
        actions: actions,
    };

    // make POST http request
    fetch(MESSAGES_API_URL, {
        method: "POST",
        body: JSON.stringify(message),
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

        setAlertMessage("Message created successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        resetForm(); 
        navigateToAppMessagesPage();
  
        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while creating new message: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });  
       
  }

  function resetForm() {
    (document.getElementById("messageForm") as HTMLFormElement)?.reset();
    setSwitchValue(false);
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

  function handleActionTitleChange(index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
          <h1>New Message</h1>
          <form id="messageForm" onSubmit={submitHandler} className="column">
            <TextField 
              required 
              label="Title" 
              id="title" 
              variant="outlined" 
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <TextField 
              required
              multiline 
              label="Body" 
              minRows={10} 
              maxRows={10} 
              id="body" 
              className="marginTopMedium"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <div>
              <FormControlLabel 
                control=
                  {
                    <Switch
                      checked={switchValue}
                      onChange={() => setSwitchValue(!switchValue)}
                    ></Switch>
                  }
                label="Blocking"
                labelPlacement="start"
                sx={{ marginLeft: 0 }}
                className="marginTopMedium"
              />
            </div>
            <TextField
              label="Start Date"
              type="datetime-local"
              id="startDate"
              InputLabelProps={{ shrink: true }}
              className="marginTopMedium"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <TextField
              required
              label="End Date"
              type="datetime-local"
              id="endDate"
              InputLabelProps={{ shrink: true }}
              className="marginTopMedium"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
            <h3 className="marginTopMedium centeredElement">Actions</h3>
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
                      <TextField type="text" 
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
              <p className="marginTopSmall centeredElement">no actions added</p>
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
              save
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
