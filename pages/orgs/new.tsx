import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { getSession } from "next-auth/react";
import createOrg from "../../api/orgs/createOrg";
import Routes from "../../routes/routes";
import CustomSnackbar from "../../components/CustomSnackbar";

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
