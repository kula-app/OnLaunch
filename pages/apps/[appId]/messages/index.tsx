import Moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../../../components/Navbar";
import styles from "../../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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

  const APPS_API_URL = "/api/frontend/v0.1/apps/";
  const MESSAGES_API_URL = "/api/frontend/v0.1/messages/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [messages, setMessages] = useState(Array<Message>());
  const [appName, setAppName] = useState("");
  const { appId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    if (appId) {
      fetch(APPS_API_URL + appId)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data.messages), setAppName(data.name);
        });
    }
  }, [router.isReady]);

  function navigateToEditMessagePage(id: number) {
    router.push(`/apps/${router.query.appId}/messages/${id}/edit`);
  }

  function navigateToNewMessagePage() {
    router.push(`/apps/${router.query.appId}/messages/new`);
  }

  function deleteMessage(id: number) {
    fetch(MESSAGES_API_URL + id, {
      method: "DELETE",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      
      setAlertMessage(`Message with id '${id}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);
      setMessages(messages.filter((message) => message.id !== id));

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while deleting message with id ${id}: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    });    
  }

  return (
    <>
      <div>
        <Navbar />
        <main className={styles.main}>
          <h1>{appName}</h1>
          <div className="addButton">
            <Button
              variant="contained"
              onClick={() => {
                navigateToNewMessagePage();
              }}
            >
              New Message
            </Button>
          </div>
          <Table
            sx={{ minWidth: 650, maxWidth: 1300 }}
            aria-label="simple table"
            className="messageTable"
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Body</strong>
                </TableCell>
                <TableCell>
                  <strong>Blocking</strong>
                </TableCell>
                <TableCell>
                  <strong>Start Date</strong>
                </TableCell>
                <TableCell>
                  <strong>End Date</strong>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((message, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{message.id}</TableCell>
                    <TableCell>{message.title}</TableCell>
                    <TableCell>{message.body}</TableCell>
                    <TableCell>{String(message.blocking)}</TableCell>
                    <TableCell>
                      {Moment(message.startDate).format("DD.MM.YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      {Moment(message.endDate).format("DD.MM.YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="hiddenTableElement">
                        <IconButton onClick={() => navigateToEditMessagePage(message.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => deleteMessage(message.id)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
