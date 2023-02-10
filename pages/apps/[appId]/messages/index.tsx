import Moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
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
import Snackbar from "@mui/material/Snackbar";
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { AlertColor } from '@mui/material/Alert';

interface Action {
  title: string;
}
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

interface App {
  name: string;
  id: number;
  messages: Message[];
}

export default function MessagesOfAppPage() {
  const router = useRouter();

  const APPS_API_URL = "/api/frontend/v0.1/apps/";
  const MESSAGES_API_URL = "/api/frontend/v0.1/messages/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageId, setMessageId] = useState(-1);

  const { appId } = router.query;

  const now = Moment.now();

  const fetcher = (...args: any) => fetch(args).then((res) => res.json());
  const { data, error, mutate } = useSWR<App>(appId ? APPS_API_URL + appId : null, fetcher);
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  function navigateToEditMessagePage(id: number) {
    router.push(`/apps/${router.query.appId}/messages/${id}/edit`);
  }

  function navigateToNewMessagePage() {
    router.push(`/apps/${router.query.appId}/messages/new`);
  }

  function handleDelete(id: number) {
    setMessageId(id);
    const message = data?.messages.find(x => x.id == id);
    if ( message && Moment(message.startDate).isBefore(now) && Moment(message.endDate).isAfter(now)) {
        setShowDeleteDialog(true);
    } else {
        deleteMessage(id);
    }
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
      
      mutate();

      setAlertMessage(`Message with id '${id}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);

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
          <h1>{data.name}</h1>
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
                <TableCell className="centeredText">
                  <strong>ID</strong>
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <strong>Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Body</strong>
                </TableCell>
                <TableCell className="centeredText">
                  <strong>Blocking</strong>
                </TableCell>
                <TableCell>
                  <strong>Start Date</strong>
                </TableCell>
                <TableCell>
                  <strong>End Date</strong>
                </TableCell>
                <TableCell className="centeredText">
                  <strong># Actions</strong>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.messages.map((message: Message, index: number) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="centeredText">
                      {message.id}
                    </TableCell>
                    <TableCell>
                      <div className="centeredElement">
                        { Moment(message.startDate).isBefore(now) && Moment(message.endDate).isAfter(now) && (
                            <Tooltip title="this message is currently displayed in apps" >
                                <Chip label="active" color="success" size="small" />
                            </Tooltip>
                        )}
                        { Moment(message.endDate).isBefore(now) && (
                            <Tooltip title="this message will not be displayed again in apps" >
                                <Chip label="past" size="small" variant="outlined" />
                            </Tooltip>
                        )}
                        { Moment(message.startDate).isAfter(now) && (
                            <Tooltip title="this message will be displayed in apps in the future" >
                                <Chip label="upcoming" color="secondary" size="small" variant="outlined" />
                            </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.title}
                    </TableCell>
                    <TableCell>
                      {message.body}
                    </TableCell>
                    <TableCell className="centeredText">
                        {String(message.blocking)}
                    </TableCell>
                    <TableCell>
                      {Moment(message.startDate).format("DD.MM.YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      {Moment(message.endDate).format("DD.MM.YYYY HH:mm:ss")}
                    </TableCell>
                    <TableCell className="centeredText">
                      {message.actions.length}
                    </TableCell>
                    <TableCell>
                      <div className="hiddenTableElement">
                        <Tooltip title="edit" >
                            <IconButton onClick={() => navigateToEditMessagePage(message.id)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="delete" >
                            <IconButton onClick={() => handleDelete(message.id)}>
                                <DeleteForeverIcon />
                            </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {data.messages.length == 0 && (
            <p className="marginTopMedium">no data to show</p>
          )}
          <Snackbar 
            open={showAlert} 
            autoHideDuration={6000} 
            onClose={() => setShowAlert(false)}
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
            <Alert
              className="marginTopMedium"
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
          <Dialog
            open={showDeleteDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
            <DialogTitle id="alert-dialog-title">
              {`Delete currently active Message with id '${messageId}?`}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This message is currently displayed in apps. Deletion cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button onClick={() => {setShowDeleteDialog(false); deleteMessage(messageId)}} autoFocus>
                Agree
              </Button>
            </DialogActions>
          </Dialog>
        </main>
      </div>
    </>
  );
}
