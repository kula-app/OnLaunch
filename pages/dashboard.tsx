import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import type { AlertColor } from "@mui/material/Alert";
import { getSession } from "next-auth/react";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import getDirectInviteToken from "../api/tokens/getDirectInviteToken";
import getOrgInviteToken from "../api/tokens/getOrgInviteToken";
import joinOrgViaDirectInvite from "../api/tokens/joinOrgViaDirectInvite";
import joinOrgViaOrgInvite from "../api/tokens/joinOrgViaOrgInvite";
import { useOrgs } from "../api/orgs/useOrgs";
import Routes from "../routes/routes";
import { OrgInvite } from "../models/orgInvite";
import CustomSnackbar from "../components/CustomSnackbar";
import { CircularProgress } from "@mui/material";

export default function DashboardPage() {
  const router = useRouter();

  const { invite, directinvite } = router.query;

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [orgInvite, setOrgInvite] = useState<OrgInvite>();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    async function showInvitation() {
      try {
        if (!!invite) {
          setOrgInvite(await getOrgInviteToken(invite as string));
          setShowInviteDialog(true);
        } else if (!!directinvite) {
          setOrgInvite(await getDirectInviteToken(directinvite as string));
          setShowInviteDialog(true);
        }
      } catch (error) {
        setAlertMessage(`Error while joining organisation: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    }
    if (!!invite || !!directinvite) {
      showInvitation();
    }
  }, [router.isReady, invite, directinvite]);

  function navigateToAppsPage(id: number) {
    router.push(Routes.getOrgAppsByOrgId(id));
  }

  const { orgs, isLoading, isError, mutate } = useOrgs();
  if (isError) return <div>Failed to load</div>;

  function navigateToNewOrgPage() {
    router.push(Routes.createNewOrg);
  }

  function navigateToOrgPage(orgId: number) {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  }

  async function joinOrg(id: number) {
    try {
      if (!!invite) {
        await joinOrgViaOrgInvite(invite as string);
      } else if (!!directinvite) {
        await joinOrgViaDirectInvite(directinvite as string);
      }
      if (!!invite || !!directinvite) {
        setAlertMessage(`Successfully joined organisation with id ${id}!`);
        setAlertSeverity("success");
        setShowAlert(true);

        navigateToOrgPage(id);
      }
    } catch (error) {
      setAlertMessage(`Error while joining: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
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
          </TableHead>
          <TableBody>
            {orgs?.map((org, index) => {
              return (
                <TableRow
                  className="clickable-row"
                  key={index}
                  onClick={() => navigateToAppsPage(org.id)}
                >
                  <TableCell width="5%">{org.id}</TableCell>
                  <TableCell>{org.name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {orgs?.length == 0 && (
          <p className="marginTopMedium">no data to show</p>
        )}
        {isLoading && (
          <div>
            <p className="marginTopMedium">Loading...</p>
            <CircularProgress />
          </div>
        )}
        <CustomSnackbar
          message={alertMessage}
          severity={alertSeverity}
          isOpenState={[showAlert, setShowAlert]}
        />
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
            <Button
              onClick={() => {
                setShowInviteDialog(false);
                joinOrg(Number(orgInvite?.id));
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
