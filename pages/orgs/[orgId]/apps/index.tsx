import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { SelectChangeEvent } from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import deleteApp from "../../../../api/deleteApp";
import deleteUserFromOrg from "../../../../api/deleteUserFromOrg";
import inviteUser from "../../../../api/inviteUser";
import resetOrgInvitationToken from "../../../../api/resetOrgInvitationToken";
import updateUserRoleInOrg from "../../../../api/updateUserRoleInOrg";
import { useApps } from "../../../../api/useApps";
import { useOrg } from "../../../../api/useOrg";
import { useUsers } from "../../../../api/useUsers";
import Routes from "../../../../routes/routes";

export default function AppsPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);

  const roles = ["ADMIN", "USER"];

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appId, setAppId] = useState(-1);
  const [userEmail, setUserEmail] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const { data: session } = useSession();

  function navigateToMessagesPage(appId: number) {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }

  const { apps, isError: error, mutate } = useApps(orgId);
  const { users, isError: userError, mutate: userMutate } = useUsers(orgId);
  const { org, isError: orgError } = useOrg(orgId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  if (error || userError || orgError) return <div>Failed to load</div>;

  let userRole = "";
  if (!!users) {
    userRole = users.find((i) => i.email === session?.user?.email)
      ?.role as string;
  }

  function navigateToEditAppPage(appId: number) {
    router.push(Routes.editAppForOrgIdAndAppId(orgId, appId));
  }

  function navigateToHome() {
    router.push(Routes.INDEX);
  }

  function navigateToNewAppPage() {
    router.push(Routes.createNewAppForOrgId(orgId));
  }

  function handleDelete(id: number) {
    setAppId(id);
    setShowDeleteDialog(true);
  }

  async function callDeleteApp(appId: number) {
    try {
      await deleteApp(orgId, appId);

      mutate();

      setAlertMessage(`App with id '${appId}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);
    } catch (error) {
      setAlertMessage(`Error while deleting app with id ${appId}: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  async function removeUser(userId: number) {
    try {
      await deleteUserFromOrg(orgId, userId);

      if (
        userId ===
        Number(users?.find((i) => i.email === session?.user?.email)?.id)
      ) {
        navigateToHome();
      } else {
        userMutate();

        setAlertMessage(`User successfully removed from organisation!`);
        setAlertSeverity("success");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage(`Error while removing user: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  async function resetInvitation() {
    try {
      await resetOrgInvitationToken(org?.invitationToken as string);

      setAlertMessage("Invitation link changed successfully!");
      setAlertSeverity("success");
      setShowAlert(true);
    } catch (error) {
      setAlertMessage(`Error while changing invitation link: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await inviteUser(orgId, userEmail);

      setAlertMessage("User invited successfully!");
      setAlertSeverity("success");
      setShowAlert(true);

      setUserEmail("");
    } catch (error) {
      setAlertMessage(`Error while adding new user: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  async function handleRoleChange(
    index: number,
    event: SelectChangeEvent<unknown>
  ) {
    if (!users) {
      return;
    }

    let user = [...users][index];

    try {
      await updateUserRoleInOrg(
        orgId,
        Number(user.id),
        event.target.value as string
      );

      userMutate();

      setAlertMessage(
        `User with email ${user.email} is now ${event.target.value}`
      );
      setAlertSeverity("success");
      setShowAlert(true);
    } catch (error) {
      setAlertMessage(`Error while updating user role: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
      <Head>
        <title>OnLaunch</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Organisation {org?.name}</h1>
        <h1>Apps</h1>
        {userRole === "ADMIN" && (
          <div className="addButton">
            <Button
              variant="contained"
              onClick={() => {
                navigateToNewAppPage();
              }}
            >
              New App
            </Button>
          </div>
        )}
        <Table sx={{ minWidth: 650, maxWidth: 1000 }} aria-label="simple table">
          <TableHead>
            <TableCell width="5%">
              <strong>ID</strong>
            </TableCell>
            <TableCell>
              <strong>App Name</strong>
            </TableCell>
            <TableCell width="5%"></TableCell>
          </TableHead>
          <TableBody>
            {apps?.map((app, index) => {
              return (
                <TableRow key={index}>
                  <TableCell width="5%">{app.id}</TableCell>
                  <TableCell>{app.name}</TableCell>
                  <TableCell width="5%">
                    <div className="hiddenTableElement">
                      <Tooltip title="view messages">
                        <IconButton
                          onClick={() => navigateToMessagesPage(app.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {app.role === "ADMIN" && (
                        <Tooltip title="edit">
                          <IconButton
                            onClick={() => navigateToEditAppPage(app.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {app.role === "ADMIN" && (
                        <Tooltip title="delete">
                          <IconButton onClick={() => handleDelete(app.id)}>
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {apps?.length == 0 && (
          <p className="marginTopMedium">no data to show</p>
        )}
        <div className={styles.main}>
          <h1>Users</h1>
          {userRole === "ADMIN" && (
            <div className="row">
              <TextField
                disabled
                label="Invitation link"
                id="invite"
                value={baseUrl + "/dashboard?invite=" + org?.invitationToken}
              />
              <div className="column">
                <Button
                  variant="contained"
                  sx={{ marginLeft: 5 }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      baseUrl +
                        "/dashboard?invite=" +
                        (org?.invitationToken as string)
                    );
                    setAlertMessage("Invitation link copied to clipboard");
                    setAlertSeverity("success");
                    setShowAlert(true);
                  }}
                >
                  copy
                </Button>
                <Button
                  variant="contained"
                  sx={{ marginLeft: 5, marginTop: 1 }}
                  onClick={() => {
                    resetInvitation();
                  }}
                >
                  reset
                </Button>
              </div>
            </div>
          )}
          {userRole === "ADMIN" && (
            <form
              id="emailForm"
              onSubmit={submitHandler}
              className="row marginTopMedium"
            >
              <TextField
                required
                label="Email"
                id="email"
                value={userEmail}
                onChange={(event) => setUserEmail(event.target.value)}
              />
              <div className="addButton">
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ marginLeft: 5 }}
                >
                  Invite User
                </Button>
              </div>
            </form>
          )}
          <Table
            sx={{ minWidth: 650, maxWidth: 1000 }}
            aria-label="simple table"
          >
            <TableHead>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Role</strong>
              </TableCell>
              <TableCell></TableCell>
            </TableHead>
            <TableBody>
              {users?.map((user, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {user.firstName + " " + user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {userRole === "ADMIN" && (
                        <div>
                          <Select
                            disabled={user.email === session?.user?.email}
                            label="Role"
                            value={user.role}
                            onChange={(event) => handleRoleChange(index, event)}
                          >
                            {roles.map((value, index) => {
                              return (
                                <MenuItem key={index} value={value}>
                                  {value}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          <Tooltip
                            title={
                              user.email === session?.user?.email
                                ? "leave organisation"
                                : "remove from organisation"
                            }
                          >
                            <IconButton
                              onClick={() => removeUser(Number(user.id))}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                      )}
                      {userRole === "USER" && (
                        <div>
                          {(user.role as string).toLowerCase()}

                          {user.email === session?.user?.email && (
                            <Tooltip title="leave organisation">
                              <IconButton
                                onClick={() => removeUser(Number(user.id))}
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {users?.length == 0 && (
            <p className="marginTopMedium">no data to show</p>
          )}
        </div>
        <Snackbar
          open={showAlert}
          autoHideDuration={6000}
          onClose={() => setShowAlert(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
            {`Delete App with id '${appId}?`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                callDeleteApp(appId);
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </main>
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
