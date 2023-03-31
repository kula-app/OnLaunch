import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import type { AlertColor } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import { getSession } from "next-auth/react";
import getOrg from "../../../api/getOrg";
import updateOrg from "../../../api/updateOrg";
import Routes from "../../../routes/routes";
import { Org } from "../../../models/org";

export default function EditOrgPage() {
  const router = useRouter();

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const [orgName, setOrgName] = useState("");

  const orgId = Number(router.query.orgId);

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

  return (
    <>
      <div>
        <main className={styles.main}>
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
