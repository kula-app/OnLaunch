import Moment from "moment";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "../../../../../../../components/Navbar";
import styles from "../../../../../../../styles/Home.module.css";

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
import { useSession, getSession } from 'next-auth/react';

type Action = {
  actionType: string;
  buttonDesign: string;
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

  const { data: session, status } = useSession();
  const loading = status === "loading";

  const actionTypes = ["DISMISS"];
  const buttonDesigns = ["TEXT", "FILLED"];

  const orgId = router.query.orgId;
  const appId = router.query.appId;

  const MESSAGES_API_URL = `/api/frontend/v0.1/orgs/${orgId}/apps/${appId}/messages/`;

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  const [actions, setActions] = useState<Action[]>([]);

  const [switchValue, setSwitchValue] = useState(false);
  const messageId  = router.query.messageId;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
  }, [router.isReady, MESSAGES_API_URL, messageId]);

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let message: Message = {
      id: Number(router.query.messageId),
      title: title,
      body: body,
      blocking: switchValue,
      startDate: startDate,
      endDate: endDate,
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
    router.push(`/orgs/${orgId}/apps/${router.query.appId}/messages/`);
  } 

  function fillForm(msg: Message) {

    // fill the form
    setTitle(msg.title);
    setBody(msg.body);
    setSwitchValue(msg.blocking);
    setStartDate(Moment(msg.startDate).format(
      "YYYY-MM-DDTHH:mm:ss"
    ));
    setEndDate(Moment(msg.endDate).format(
      "YYYY-MM-DDTHH:mm:ss"
    ));
    setActions(msg.actions);
  }

  
  function addAction() {
    setActions(oldActions => [...oldActions, { actionType: actionTypes[0], buttonDesign: buttonDesigns[0], title: "" }]);
  }

  function deleteAction(index: number) {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  }

  function handleActionTitleChange(index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    let data = [...actions];
    data[index]["title"] = event.target.value;
    setActions(data);
  }

  function handleActionTypeChange(index: number, event: SelectChangeEvent<unknown>) {
    let data = [...actions];
    data[index]["actionType"] = event.target.value as string;
    setActions(data);
  }

  function handleButtonDesignChange(index: number, event: SelectChangeEvent<unknown>) {
    let data = [...actions];
    data[index]["buttonDesign"] = event.target.value as string;
    setActions(data);
  }

  return (
    <>
      <div>
        <Navbar hasSession={!!session} />
        <main className={styles.main}>
          <h1>Edit Message</h1>
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
                    <strong>Design</strong>
                  </TableCell>
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
                          label="ButtonDesign"
                          value={action.buttonDesign}
                          onChange={event => handleButtonDesignChange(index, event)}
                        >
                          {buttonDesigns.map((value, index) => {
                            return (
                              <MenuItem key={index} value={value}>{value}</MenuItem>
                            )
                          })}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          label="ActionType"
                          value={action.actionType}
                          onChange={event => handleActionTypeChange(index, event)}
                        >
                          {actionTypes.map((value, index) => {
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
                      <TableCell width="5%">
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