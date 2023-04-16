import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../../../../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { getSession } from "next-auth/react";
import createApp from "../../../../api/apps/createApp";
import Routes from "../../../../routes/routes";
import CustomSnackbar from "../../../../components/CustomSnackbar";

export default function NewAppPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [appName, setAppName] = useState("");

  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createApp(orgId, appName);

      setAlertMessage("App created successfully!");
      setAlertSeverity("success");
      setShowAlert(true);

      resetForm();
      navigateToAppsPage();
    } catch (error) {
      setAlertMessage(`Error while creating new app: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  function resetForm() {
    (document.getElementById("appForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <h1>New App</h1>
          <form id="appForm" onSubmit={submitHandler} className="column">
            <TextField
              required
              label="Name"
              id="name"
              onChange={(event) => setAppName(event.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              className="marginTopMedium"
            >
              save
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
