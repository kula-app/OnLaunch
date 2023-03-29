import Moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import Navbar from "../../../../../../components/Navbar";
import styles from "../../../../../../styles/Home.module.css";

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
import { getSession, useSession } from 'next-auth/react';
import { TextField } from "@mui/material";
import Routes from "../../../../../../routes/routes";
import ApiRoutes from "../../../../../../routes/apiRoutes";

// TODO: see org/new.tsx for partial types

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
  role: string;
  publicKey: string;
  messages: Message[];
}

// TODO: see `dashboard.tsx` for all the comments about API communication & shared classes

export default function MessagesOfAppPage() {
  const router = useRouter();
  
  const { data: session } = useSession();
  
  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const APPS_API_URL = ApiRoutes.getAppsByOrgId(orgId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageId, setMessageId] = useState(-1);

  const now = Moment.now();

  const fetcher = (...args: any) => fetch(args).then((res) => res.json());
  const { data, error, mutate } = useSWR<App>(appId ? ApiRoutes.getAppByOrgIdAndAppId(orgId, appId) : null, fetcher);
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  function navigateToEditMessagePage(messageId: number) {
    router.push(Routes.editMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId));
  }

  function navigateToNewMessagePage() {
    router.push(Routes.createNewMessageForOrgIdAndAppId(orgId, appId));
  }

  function handleDelete(messageId: number) {
    setMessageId(messageId);
    const message = data?.messages.find(x => x.id == messageId);
    if ( message && Moment(message.startDate).isBefore(now) && Moment(message.endDate).isAfter(now)) {
        setShowDeleteDialog(true);
    } else {
        deleteMessage(messageId);
    }
  }

  function deleteMessage(messageId: number) {
    fetch(ApiRoutes.getMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId), {
      method: "DELETE",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      
      mutate();

      setAlertMessage(`Message with id '${messageId}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while deleting message with id ${messageId}: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    });    
  }

  return (
    <>
      <div>
        <Navbar hasSession={!!session} />
        <main className={styles.main}>
          <h1>{data.name}</h1>
          {data.role === "ADMIN" && <div className="row">
            <TextField 
              disabled 
              label="Public Key for Clients"
              id="publicKey" 
              value={data.publicKey}
            />
            <Button
              variant="contained"
              sx={{ marginLeft: 2 }}
              onClick={() => {
                navigator.clipboard.writeText(data.publicKey);
                setAlertMessage("Public key copied to clipboard");
                setAlertSeverity("success");
                setShowAlert(true);
              }}
            >
              copy
            </Button>
          </div>
          }
          <div className="addButton marginTopLarge">
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
