import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import type { AlertColor } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { getSession } from "next-auth/react";
import createOrg from "../../api/createOrg";
import Routes from "../../routes/routes";

export default function NewOrgPage() {
  const router = useRouter();

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [orgName, setOrgName] = useState("");

  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createOrg(orgName);

      setAlertMessage("Org created successfully!");
      setAlertSeverity("success");
      setShowAlert(true);

      resetForm();
      navigateToDashboardPage();
    } catch (error) {
      setAlertMessage(`Error while creating new org: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }

  function resetForm() {
    (document.getElementById("orgForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <h1>New Organisation</h1>
          <form id="orgForm" onSubmit={submitHandler} className="column">
            <TextField
              required
              label="Name"
              id="name"
              onChange={(event) => setOrgName(event.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              className="marginTopMedium"
            >
              save
            </Button>
          </form>
          <Snackbar
            open={showAlert}
            autoHideDuration={6000}
            onClose={() => setShowAlert(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
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
