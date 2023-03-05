import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../../../../styles/Home.module.css";
import useSWR from "swr";
import { useState, FormEvent } from "react";
import { useSession, getSession } from 'next-auth/react';
import Navbar from "../../../../components/Navbar";

import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { AlertColor } from '@mui/material/Alert';
import TextField from "@mui/material/TextField";
import { SelectChangeEvent } from "@mui/material";

interface App {
  name: string;
  id: number;
  role: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Org {
  invitationToken: string;
  name: string;
  role: string;
}

export default function AppsPage() {
  const router = useRouter();
  
  const orgId = router.query.orgId;

  
  const roles = ["ADMIN", "USER"];

  const APPS_API_URL = `/api/frontend/v0.1/orgs/${orgId}/apps/`;
  const ORG_USERS_API_URL = `/api/frontend/v0.1/orgs/${orgId}/users/`;
  const ORG_API_URL = `/api/frontend/v0.1/orgs/`;
  const ORG_INVITE_API_URL = "/api/frontend/v0.1/tokens/organisationInvitation/";
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appId, setAppId] = useState(-1);
  const [userEmail, setUserEmail] = useState("");

  const { data: session, status } = useSession();
  const loading = status === "loading";

  function navigateToMessagesPage(id: number) {
    router.push(`/orgs/${orgId}/apps/${id}/messages`);
  }

  // @ts-ignore
  const fetcher = (...args: any) => fetch(...args).then((res) => res.json());
  const { data, error, mutate } = useSWR<App[]>(router.isReady ? APPS_API_URL : undefined, fetcher);
  const { data: userData, error: userError, mutate: userMutate } = useSWR<User[]>(router.isReady ? ORG_USERS_API_URL : undefined, fetcher);
  const { data: orgData, error: orgError, mutate: orgMutate } = useSWR<Org>(router.isReady ? ORG_API_URL + orgId : undefined, fetcher);
  if (error || userError || orgError) return <div>Failed to load</div>;
  if (!data || !userData || !orgData) return <div>Loading...</div>;

  let userRole = "";
  if (!!userData) {
    userRole = userData.find(i => i.email === session?.user?.email)?.role as string;
  }
  
  function navigateToEditAppPage(id: number) {
    router.push(`/orgs/${orgId}/apps/${id}/edit`);
  }

  function navigateToHome() {
    router.push("/");
  }

  function navigateToNewAppPage() {
    router.push(`/orgs/${orgId}/apps/new`);
  }

  function handleDelete(id: number) {
    setAppId(id);
    setShowDeleteDialog(true);
  }

  function deleteApp(id: number) {
    fetch(APPS_API_URL + id, {
      method: "DELETE",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      
      mutate();
      
      setAlertMessage(`App with id '${id}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while deleting app with id ${id}: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    });    
  }

  function removeUser(id: number) {
    fetch(ORG_USERS_API_URL + id, {
      method: "DELETE",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
    
      if (id === Number(userData?.find(i => i.email === session?.user.email)?.id)) {
        navigateToHome();
      } else {

        userMutate();
        
        setAlertMessage(`User successfully removed from organisation!`);
        setAlertSeverity("success");
        setShowAlert(true);
      }

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while removing user: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    });    
  }

  function resetInvitation() {
    fetch(ORG_INVITE_API_URL + orgData?.invitationToken, {
      method: "PUT",
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

        setAlertMessage("Invitation link changed successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while changing invitation link: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }); 
  }

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // make POST http request
    fetch(ORG_USERS_API_URL, {
        method: "POST",
        body: JSON.stringify({ email: userEmail }),
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

        setAlertMessage("User invited successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while adding new user: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }); 
  }

  function handleRoleChange(index: number, event: SelectChangeEvent<unknown>) {
    if (!userData) {
      return;
    }

    let users = [... userData];
    let user = users[index];

    fetch(ORG_USERS_API_URL, {
      method: "PUT",
      body: JSON.stringify({ role: event.target.value, userId: user.id, orgId: orgId }),
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

        userMutate();

        setAlertMessage(`User with email ${user.email} is now ${event.target.value}`);
        setAlertSeverity("success");
        setShowAlert(true);

        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while updating user role: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }); 
  }

  return (
    <>
      <Head>
        <title>OnLaunch</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar hasSession={!!session} />
      <main className={styles.main}>
        <h1>Organisation {orgData?.name}</h1>
        <h1>Apps</h1>
        {userRole === "ADMIN" && <div className="addButton">
            <Button
              variant="contained"
              onClick={() => {
                navigateToNewAppPage();
              }}
            >
              New App
            </Button>
          </div>
          }
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
            {data.map((app, index) => {
              return (
                <TableRow key={index} >
                  <TableCell width="5%">
                    {app.id}
                  </TableCell>
                  <TableCell>
                    {app.name}
                  </TableCell>
                  <TableCell width="5%">
                      <div className="hiddenTableElement">
                      <Tooltip title="view messages" >
                          <IconButton onClick={() => navigateToMessagesPage(app.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {app.role === "ADMIN" && <Tooltip title="edit" >
                          <IconButton onClick={() => navigateToEditAppPage(app.id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        }
                        {app.role === "ADMIN" && <Tooltip title="delete" >
                          <IconButton onClick={() => handleDelete(app.id)}>
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                        }
                      </div>
                    </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {data.length == 0 && (
          <p className="marginTopMedium">no data to show</p>
        )}
        <div className={styles.main}>
          <h1>Users</h1>
          {userRole === "ADMIN" && <div className="row">
            <TextField 
              disabled 
              label="Invitation link"
              id="invite" 
              value={"localhost:3000/dashboard?invite=" + orgData?.invitationToken}
            />
            <div className="column">
              <Button
                variant="contained"
                sx={{ marginLeft: 5 }}
                onClick={() => {
                  navigator.clipboard.writeText("localhost:3000/dashboard?invite="+(orgData?.invitationToken as string));
                  setAlertMessage("Public key copied to clipboard");
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
          }
            {userRole === "ADMIN" && <form id="emailForm" 
              onSubmit={submitHandler} 
              className="row marginTopMedium"
            >
              <TextField 
                required 
                label="Email"
                id="email" 
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
            }
          <Table sx={{ minWidth: 650, maxWidth: 1000 }} aria-label="simple table">
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
              {userData.map((user, index) => {
                return (
                  <TableRow key={index} >
                    <TableCell >
                      {user.firstName + " " + user.lastName}
                    </TableCell>
                    <TableCell>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {userRole === "ADMIN" && <div>
                        <Select 
                          disabled={user.email === session?.user.email}
                          label="Role"
                          value={user.role}
                          onChange={event => handleRoleChange(index, event)}
                        >
                          {roles.map((value, index) => {
                            return (
                              <MenuItem key={index} value={value}>{value}</MenuItem>
                            )
                          })}
                        </Select>  
                        <Tooltip title={user.email === session?.user.email ? "leave organisation" : "remove from organisation"} >
                          <IconButton onClick={() => removeUser(user.id)}>
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      </div>}
                      {userRole === "USER" && 
                        <div>
                          {user.role.toLowerCase()}
                          
                        {user.email === session?.user.email && <Tooltip title="leave organisation" >
                          <IconButton onClick={() => removeUser(user.id)}>
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>}
                        </div> }
                    </TableCell>
                    <TableCell>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {userData.length == 0 && (
            <p className="marginTopMedium">no data to show</p>
          )}
        </div>
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
              {`Delete App with id '${appId}?`}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button onClick={() => {setShowDeleteDialog(false); deleteApp(appId)}} autoFocus>
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
        destination: '/auth',
        permanent: false,
      }
    }
  }

  return {
    props: { session },
  };
}