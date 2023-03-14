import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import styles from "../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import type { AlertColor } from '@mui/material/Alert';
import { useSession, getSession } from 'next-auth/react';

// TODO: See `new.tsx` about partial types
interface Org {
  name: string;
  id: number;
}

// TODO: see `dashboard.tsx` for all the comments about API communication & shared classes

export default function EditOrgPage() {
  const router = useRouter();
  
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const ORGS_API_URL = "/api/frontend/v0.1/orgs/";

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const[orgName, setOrgName] = useState("");

  const { orgId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    fetch(ORGS_API_URL + orgId)
    .then((response) => {
        // TODO: unify duplicate code `response.json()`
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        return response.json();
    })
    .then((data) => {
        let org: Org = {
          id: data.id,
          name: data.name,
        };

        fillForm(org);
    })
    .catch(error => {
        setAlertMessage(`Error while fetching message: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });
  }, [router.isReady, orgId]);

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let newOrg: Org = {
      id: Number(router.query.orgId),
      name: orgName,
    };

    // make PUT http request
    fetch(ORGS_API_URL + orgId, {
    method: "PUT",
    body: JSON.stringify(newOrg),
    headers: {
        "Content-Type": "application/json",
    },
    }).then((response) => {
        // TODO: unify duplicate code `response.json()`
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }

        setAlertMessage("Org edited successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        navigateToDashboardPage();
  
        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while editing org: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }); 

  }
  
  function navigateToDashboardPage() {
    router.push(`/dashboard`);
  } 

  function fillForm(org: Org) {

    // fill the form
    setOrgName(org.name);
  }

  return (
    <>
      <div>
        <Navbar hasSession={!!session} />
        <main className={styles.main}>
          <h1>Edit Organisation</h1>
          <form 
            id="orgForm" 
            onSubmit={submitHandler} 
            className="column"
          >
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
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
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
        destination: '/auth',
        permanent: false,
      }
    }
  }

  return {
    props: { session },
  };
}