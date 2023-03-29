import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import type { AlertColor } from '@mui/material/Alert';
import { useSession, getSession } from 'next-auth/react';
import Routes from "../../routes/routes";
import ApiRoutes from "../../routes/apiRoutes";

// TODO: move shared interfaces to own files.
//       As this is a partial interface of the full Org interface (ie. only name without anything else), consider using the type `Partial<Org>` instead of creating a different interface
interface Org {
  name: string;
}

// TODO: see `dashboard.tsx` for all the comments about API communication & shared classes

export default function NewOrgPage() {
  const router = useRouter();

  const { data: session } = useSession();

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const[orgName, setOrgName] = useState("");


  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  } 

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let org: Org = {
        name: orgName,
    };

    // make POST http request
    fetch(ApiRoutes.ORGS, {
        method: "POST",
        body: JSON.stringify(org),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }

        setAlertMessage("Org created successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        resetForm(); 
        navigateToDashboardPage();
  
        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while creating new org: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });  
       
  }

  function resetForm() {
    (document.getElementById("orgForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <Navbar hasSession={!!session} />
        <main className={styles.main}>
          <h1>New Organisation</h1>
          <form id="orgForm" 
            onSubmit={submitHandler} 
            className="column"
          >
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