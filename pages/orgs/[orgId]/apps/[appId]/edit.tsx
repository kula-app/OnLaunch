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

export default function EditAppPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [appName, setAppName] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const fetchAppData = async () => {
      try {
        fillForm(await getApp(orgId, appId));
      } catch (error) {
        setAlertMessage(`Error while fetching app data: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    };

    fetchAppData();
  }, [router.isReady, appId, orgId]);

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateApp(orgId, appId, appName);

      setAlertMessage("App edited successfully!");
      setAlertSeverity("success");
      setShowAlert(true);

      navigateToAppsPage();
    } catch (error) {
      setAlertMessage(`Error while editing app: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(Number(orgId)));
  }

  function fillForm(app: App) {
    // fill the form
    setAppName(app.name);
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
          <CustomSnackbar
            message={alertMessage}
            severity={alertSeverity}
            isOpenState={[showAlert, setShowAlert]}
          />
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
