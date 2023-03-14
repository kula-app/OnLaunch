import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import Button from "@mui/material/Button";
import useSWR from "swr";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from '@mui/material/Alert';
import { useSession, getSession } from 'next-auth/react';

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// TODO: move interfaces into own files, if they are reused in multiple pages
interface Organisation {
  name: string;
  id: number;
  role: string;
}

interface OrgInvite {
  id: number;
  name: string;
  invitationToken: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const { data: session } = useSession();

  const { invite, directinvite } = router.query;

  // TODO: These API URLs might be reused, move them to a shared class
  const ORGS_API_URL = "/api/frontend/v0.1/orgs/";
  const ORG_INVITE_API_URL = "/api/frontend/v0.1/tokens/organisationInvitation/";
  const DIRECT_INVITE_API_URL = "/api/frontend/v0.1/tokens/directInvitation/";
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [token, setToken] = useState("");
  const [orgInvite, setOrgInvite] = useState<OrgInvite>();
  const [tokenUrl, setTokenUrl] = useState(ORG_INVITE_API_URL);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orgId, setOrgId] = useState(-1);

  useEffect(() => {
    if (!router.isReady) return;
    if (!!invite) {
      setToken(invite as string);
      setTokenUrl(ORG_INVITE_API_URL);
      inviteHandler();
    } else if (!!directinvite) {
      setToken(directinvite as string);
      setTokenUrl(DIRECT_INVITE_API_URL);
      inviteHandler();
    }

    // TODO: consider moving the API communication into own files, so they are reusable and testable.
    //       this also separates UI from business logic, which is standard practice.
    function inviteHandler() {
      fetch(tokenUrl + token, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
      }).then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        
        return response.json();
      })
      .then((data) => {
        setOrgInvite(data);
        setShowInviteDialog(true);
      })
      .catch(error => {
        setAlertMessage(`Error while joining organisation: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true); 
      }); 
    }
  }, [router.isReady, invite, directinvite, token, tokenUrl]);

  function navigateToAppsPage(id: number) {
    router.push(`/orgs/${id}/apps`);
  }

  // TODO: Create a reusable fetcher class, ref: https://github.com/kula-app/Hermes/blob/main/frontend/src/api/useApp.ts
  // @ts-ignore
  const fetcher = (...args: any) => fetch(...args).then((res) => res.json());
  const { data, error, mutate } = useSWR<Organisation[]>(ORGS_API_URL, fetcher);
  if (error) return <div>Failed to load</div>;
  // TODO: Instead of using checking if data is not available, use the `isLoading` flag returned by useSWR and display both, 
  //       the data and the loading indicator at the same time
  if (!data) return <div>Loading...</div>;

  // TODO: it might be smart idea to move all the route strings into a shared class in its own file, e.g. AppRoutes, so when moving a page, the paths are updated
  //       everywhere in the application.
  function navigateToEditOrgPage(id: number) {
    router.push(`/orgs/${id}/edit`);
  }

  function navigateToNewOrgPage() {
    router.push(`/orgs/new`);
  }

  function navigateToOrgPage(id: number) {
    router.push(`/orgs/${id}/apps`);
  }

  function handleDelete(id: number) {
    setOrgId(id);
    setShowDeleteDialog(true);
  }

  function deleteOrg(id: number) {
    // TODO: move the API call into own file, ref: https://github.com/kula-app/Hermes/blob/main/frontend/src/api/removeJob.ts
    fetch(ORGS_API_URL + id, {
      method: "DELETE",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      
      mutate();
      
      setAlertMessage(`Organisation with id '${id}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while deleting org with id ${id}: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    });    
  }

  function joinOrg(id: number) {
    // TODO: move the API call into own file, ref: https://github.com/kula-app/Hermes/blob/main/frontend/src/api/removeJob.ts
    fetch(tokenUrl + token, {
      method: "POST",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }

      setAlertMessage(`Successfully joined organisation with id ${id}!`);
      setAlertSeverity("success");
      setShowAlert(true);

      navigateToOrgPage(id);

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while joining: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    });    
  }

  return (
    <>
      <Navbar hasSession={!!session} />
      <main className={styles.main}>
        <h1>Organisations</h1>
        <div className="addButton">
            <Button
              variant="contained"
              onClick={() => {
                navigateToNewOrgPage();
              }}
            >
              New Organisation
            </Button>
          </div>
        <Table sx={{ minWidth: 650, maxWidth: 1000 }} aria-label="simple table">
          <TableHead>
            <TableCell width="5%">
              <strong>ID</strong>
            </TableCell>
            <TableCell>
              <strong>Org Name</strong>
            </TableCell>
            <TableCell width="5%"></TableCell>
          </TableHead>
          <TableBody>
            {data.map((org, index) => {
              return (
                <TableRow key={index} >
                  <TableCell width="5%">
                    {org.id}
                  </TableCell>
                  <TableCell>
                    {org.name}
                  </TableCell>
                  <TableCell width="5%">
                      <div className="hiddenTableElement">
                      <Tooltip title="view messages" >
                          <IconButton onClick={() => navigateToAppsPage(org.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {org.role === "ADMIN" && <Tooltip title="edit" >
                          <IconButton onClick={() => navigateToEditOrgPage(org.id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        }
                        {org.role === "ADMIN" && <Tooltip title="delete" >
                          <IconButton onClick={() => handleDelete(org.id)}>
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
              {`Delete Organisation with id '${orgId}?`}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button onClick={() => {setShowDeleteDialog(false); deleteOrg(orgId)}} autoFocus>
                Agree
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={showInviteDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {`Join Organisation '${orgInvite?.name}?'`}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                You can leave any time.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowInviteDialog(false)}>Cancel</Button>
              <Button onClick={() => {setShowInviteDialog(false); joinOrg(Number(orgInvite?.id))}} autoFocus>
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