import Moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../../../../../../styles/Home.module.css";

import { MdDeleteForever, MdEdit } from "react-icons/md";
import { CircularProgress, TextField } from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { getSession } from "next-auth/react";
import deleteMessage from "../../../../../../api/messages/deleteMessage";
import { useApp } from "../../../../../../api/apps/useApp";
import Routes from "../../../../../../routes/routes";
import { Message } from "../../../../../../models/message";
import CustomSnackbar from "../../../../../../components/CustomSnackbar";

export default function MessagesOfAppPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageId, setMessageId] = useState(-1);

  const [showHistory, setShowHistory] = useState(false);

  const now = Moment.now();

  const { app: data, isLoading, isError, mutate } = useApp(orgId, appId);
  if (isError) return <div>Failed to load</div>;

  const messages = data?.messages?.filter((message) => {
    if (showHistory) {
      return new Date(message.endDate).getTime() < now;
    } else {
      return new Date(message.endDate).getTime() >= now;
    }
  });

  function navigateToEditMessagePage(messageId: number) {
    router.push(
      Routes.editMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId)
    );
  }

  function navigateToNewMessagePage() {
    router.push(Routes.createNewMessageForOrgIdAndAppId(orgId, appId));
  }

  function handleDelete(messageId: number) {
    setMessageId(messageId);
    if (data && data.messages) {
      const message = data?.messages.find((x) => x.id == messageId);
      if (
        message &&
        Moment(message.startDate).isBefore(now) &&
        Moment(message.endDate).isAfter(now)
      ) {
        setShowDeleteDialog(true);
      } else {
        callDeleteMessage(messageId);
      }
    }
  }

  async function callDeleteMessage(messageId: number) {
    try {
      await deleteMessage(orgId, appId, messageId);

      mutate();

      setAlertMessage(`Message with id '${messageId}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);
    } catch (error) {
      setAlertMessage(
        `Error while deleting message with id ${messageId}: ${error}`
      );
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  function navigateToAppSettingsPage() {
    router.push(Routes.appSettingsByOrgIdAndAppId(orgId, appId));
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <h1>{data?.name}</h1>
          {data?.role === "ADMIN" && (
            <Button
              variant="contained"
              onClick={() => {
                navigateToAppSettingsPage();
              }}
            >
              App Settings
            </Button>
          )}
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
          <div className="addButton marginTopLarge">
            <Button
              variant="text"
              onClick={() => {
                setShowHistory(!showHistory);
              }}
            >
              {showHistory
                ? `show current messages (${
                    Number(data?.messages?.length) -
                    (messages ? messages.length : 0)
                  })`
                : `show history (${
                    Number(data?.messages?.length) -
                    (messages ? messages.length : 0)
                  })`}
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
              {data?.messages &&
                messages &&
                messages.map((message: Message, index: number) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="centeredText">
                        {message.id}
                      </TableCell>
                      <TableCell>
                        <div className="centeredElement">
                          {Moment(message.startDate).isBefore(now) &&
                            Moment(message.endDate).isAfter(now) && (
                              <Tooltip title="this message is currently displayed in apps">
                                <Chip
                                  label="active"
                                  color="success"
                                  size="small"
                                />
                              </Tooltip>
                            )}
                          {Moment(message.endDate).isBefore(now) && (
                            <Tooltip title="this message will not be displayed again in apps">
                              <Chip
                                label="past"
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          )}
                          {Moment(message.startDate).isAfter(now) && (
                            <Tooltip title="this message will be displayed in apps in the future">
                              <Chip
                                label="upcoming"
                                color="secondary"
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{message.title}</TableCell>
                      <TableCell>{message.body}</TableCell>
                      <TableCell className="centeredText">
                        {String(message.blocking)}
                      </TableCell>
                      <TableCell>
                        {Moment(message.startDate).format(
                          "DD.MM.YYYY HH:mm:ss"
                        )}
                      </TableCell>
                      <TableCell>
                        {Moment(message.endDate).format("DD.MM.YYYY HH:mm:ss")}
                      </TableCell>
                      <TableCell className="centeredText">
                        {!!message.actions ? message.actions.length : 0}
                      </TableCell>
                      <TableCell>
                        <div className="hiddenTableElement">
                          <Tooltip title="edit">
                            <IconButton
                              onClick={() =>
                                navigateToEditMessagePage(Number(message.id))
                              }
                            >
                              <MdEdit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="delete">
                            <IconButton
                              onClick={() => handleDelete(Number(message.id))}
                            >
                              <MdDeleteForever />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          {data?.messages && messages && messages.length == 0 && (
            <p className="marginTopMedium">no data to show</p>
          )}
          {isLoading && (
            <div>
              <div className="marginTopMedium">Loading...</div>
              <CircularProgress />
            </div>
          )}
          <CustomSnackbar
            message={alertMessage}
            severity={alertSeverity}
            isOpenState={[showAlert, setShowAlert]}
          />
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
                This message is currently displayed in apps. Deletion cannot be
                undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setShowDeleteDialog(false);
                  callDeleteMessage(messageId);
                }}
                autoFocus
              >
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
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
