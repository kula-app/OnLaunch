import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../../styles/Home.module.css";

import type { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { getSession } from "next-auth/react";
import getOrg from "../../../api/orgs/getOrg";
import updateOrg from "../../../api/orgs/updateOrg";
import Routes from "../../../routes/routes";
import { Org } from "../../../models/org";
import CustomSnackbar from "../../../components/CustomSnackbar";

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
