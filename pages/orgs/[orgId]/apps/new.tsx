import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import Navbar from "../../../../components/Navbar";
import styles from "../../../../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import type { AlertColor } from '@mui/material/Alert';
import { useSession, getSession } from 'next-auth/react';
import Routes from "../../../../routes/routes";
import ApiRoutes from "../../../../routes/apiRoutes";
// TODO: see org/new.tsx for partial interfaces

interface App {
  name: string;
  orgId: number;
}

// TODO: see `dashboard.tsx` for all the comments about API communication & shared classes

export default function NewAppPage() {
  const router = useRouter();

  const { data: session } = useSession();

  const orgId = Number(router.query.orgId);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const[appName, setAppName] = useState("");


  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  } 

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // load data from form
    let app: App = {
        name: appName,
        orgId: orgId,
    };

    // make POST http request
    fetch(ApiRoutes.getAppsByOrgId(orgId), {
        method: "POST",
        body: JSON.stringify(app),
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

        setAlertMessage("App created successfully!");
        setAlertSeverity("success");
        setShowAlert(true);

        resetForm(); 
        navigateToAppsPage();
  
        return response.json();
    })
    .catch(error => {
        setAlertMessage(`Error while creating new app: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });  
       
  }

  function resetForm() {
    (document.getElementById("appForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <Navbar hasSession={!!session} />
        <main className={styles.main}>
          <h1>New App</h1>
          <form id="appForm" 
            onSubmit={submitHandler} 
            className="column"
          >
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