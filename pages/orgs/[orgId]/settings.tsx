import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { getSession, useSession } from "next-auth/react";
import getOrg from "../../../api/orgs/getOrg";
import updateOrg from "../../../api/orgs/updateOrg";
import Routes from "../../../routes/routes";
import { Org } from "../../../models/org";
import CustomSnackbar from "../../../components/CustomSnackbar";
import {
  SelectChangeEvent,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { MdDeleteForever } from "react-icons/md";
import updateUserRoleInOrg from "../../../api/orgs/updateUserRoleInOrg";
import { useUsers } from "../../../api/orgs/useUsers";
import deleteUserFromOrg from "../../../api/orgs/deleteUserFromOrg";
import inviteUser from "../../../api/orgs/inviteUser";
import resetOrgInvitationToken from "../../../api/tokens/resetOrgInvitationToken";
import { useOrg } from "../../../api/orgs/useOrg";
import deleteOrg from "../../../api/orgs/deleteOrg";

export default function EditOrgPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [orgName, setOrgName] = useState("");

  const roles = ["ADMIN", "USER"];
  const [baseUrl, setBaseUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchOrgData = async () => {
      try {
        const org = await getOrg(orgId);
        fillForm(org);
      } catch (error) {
        setAlertMessage(`Error while fetching org: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    };

    fetchOrgData();
  }, [router.isReady, orgId]);

  const { data: session } = useSession();

  const { org, isError: orgError } = useOrg(orgId);
  const { users, isError: userError, mutate: userMutate } = useUsers(orgId);

  if (userError || orgError) return <div>Failed to load</div>;

  let userRole = "";
  if (!!users) {
    userRole = users.find((i) => i.email === session?.user?.email)
      ?.role as string;
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let newOrg: Org = {
      id: Number(router.query.orgId),
      name: orgName,
    };

    try {
      await updateOrg(newOrg);

      setAlertMessage("Org edited successfully!");
      setAlertSeverity("success");
      setShowAlert(true);

      navigateToDashboardPage();
    } catch (error) {
      setAlertMessage(`Error while editing org: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  }

  function fillForm(org: Org) {
    // fill the form
    setOrgName(org.name);
  }

  async function removeUser(userEmail: string) {
    try {
      await deleteUserFromOrg(orgId, userEmail);

      if (userEmail === session?.user?.email) {
        navigateToDashboardPage();
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

  async function userInviteHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await inviteUser(orgId, userEmail);

      setAlertMessage("User invited successfully!");
      setAlertSeverity("success");
      setShowAlert(true);

      setUserEmail("");
      userMutate();
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

  function handleDelete() {
    setShowDeleteDialog(true);
  }

  async function delOrg() {
    try {
      await deleteOrg(orgId);

      setAlertMessage(`Organisation with id '${orgId}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);

      navigateToDashboardPage();
    } catch (error) {
      setAlertMessage(`Error while deleting org with id ${orgId}: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          {userRole === "ADMIN" && (
            <div>
              <h1>Edit Organisation</h1>
              <form id="orgForm" onSubmit={submitHandler} className="column">
                <TextField
                  required
                  label="Name"
                  id="name"
                  value={orgName}
                  onChange={(event) => setOrgName(event.target.value)}
                />
                <Button
                  variant="contained"
                  type="submit"
                  className="marginTopMedium"
                >
                  update
                </Button>
              </form>
            </div>
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
                onSubmit={userInviteHandler}
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
                <TableRow>
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
                </TableRow>
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
                              onChange={(event) =>
                                handleRoleChange(index, event)
                              }
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
                                onClick={() => removeUser(user.email)}
                              >
                                <MdDeleteForever />
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
                                  onClick={() => removeUser(user.email)}
                                >
                                  <MdDeleteForever />
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

            {userRole === "ADMIN" && (
              <div className="column">
                <h1 className="marginTopLarge">Delete Organisation</h1>
                <Button
                  variant="contained"
                  endIcon={<MdDeleteForever />}
                  color="error"
                  onClick={() => handleDelete()}
                >
                  delete
                </Button>
              </div>
            )}
          </div>
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
              {`Delete Organisation '${org?.name}?`}
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
                  delOrg();
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
