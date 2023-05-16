import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../../../../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { getSession } from "next-auth/react";
import getApp from "../../../../../api/apps/getApp";
import updateApp from "../../../../../api/apps/updateApp";
import Routes from "../../../../../routes/routes";
import { App } from "../../../../../models/app";
import CustomSnackbar from "../../../../../components/CustomSnackbar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import deleteApp from "../../../../../api/apps/deleteApp";
import { MdDeleteForever } from "react-icons/md";

export default function EditAppPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [appName, setAppName] = useState("");

  const [appKey, setAppKey] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchAppData = async () => {
      try {
        const app = await getApp(orgId, appId);
        setAppKey(app.publicKey);

        if (app.role !== "ADMIN") {
          router.push(Routes.DASHBOARD);
        } else {
          fillForm(app);
        }
      } catch (error) {
        setAlertMessage(`Error while fetching app data: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    };

    fetchAppData();
  }, [router.isReady, router, appId, orgId]);

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateApp(orgId, appId, appName);

      setAlertMessage("App edited successfully!");
      setAlertSeverity("success");
      setShowAlert(true);

      navigateToAppDetailPage();
    } catch (error) {
      setAlertMessage(`Error while editing app: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  function navigateToAppDetailPage() {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }
  
  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(Number(orgId)));
  }

  function fillForm(app: App) {
    // fill the form
    setAppName(app.name);
  }

  function handleDelete() {
    setShowDeleteDialog(true);
  }

  async function callDeleteApp() {
    try {
      await deleteApp(orgId, appId);

      setAlertMessage(`App with id '${appId}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);

      navigateToAppsPage();
    } catch (error) {
      setAlertMessage(`Error while deleting app with id ${appId}: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <h1>Edit App</h1>
          <form id="appForm" onSubmit={submitHandler} className="column">
            <TextField
              required
              label="Name"
              id="name"
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              className="marginTopMedium"
            >
              update
            </Button>
          </form>
          <h1>Client API Key</h1>
          <div className="row">
            <TextField
              disabled
              label="Public Key for Clients"
              id="publicKey"
              value={appKey}
            />
            <Button
              variant="contained"
              sx={{ marginLeft: 2 }}
              onClick={() => {
                navigator.clipboard.writeText(appKey as string);
                setAlertMessage("Public key copied to clipboard");
                setAlertSeverity("success");
                setShowAlert(true);
              }}
            >
              copy
            </Button>
          </div>
          <div className="column">
            <h1 className="marginTopLarge">Delete App</h1>
            <Button
              variant="contained"
              endIcon={<MdDeleteForever />}
              color="error"
              onClick={() => handleDelete()}
            >
              delete
            </Button>
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
              {`Delete App with id '${appId}?`}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                This cannot be undone and restoring the api key is not possible.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setShowDeleteDialog(false);
                  callDeleteApp();
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
