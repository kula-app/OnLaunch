import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import useSWR from "swr";
import { useState } from "react";
import Navbar from "../components/Navbar";

import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from '@mui/material/Alert';

interface App {
  name: string;
  id: number;
}

export default function Home() {
  const router = useRouter();

  const APPS_API_URL = "/api/frontend/v0.1/apps/";
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  function navigateToMessagesPage(id: number) {
    router.push(`/apps/${id}/messages`);
  }

  // @ts-ignore
  const fetcher = (...args: any) => fetch(...args).then((res) => res.json());
  const { data, error, mutate } = useSWR<App[]>(APPS_API_URL, fetcher);
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  
  function navigateToEditAppPage(id: number) {
    router.push(`/apps/${id}/edit`);
  }

  function navigateToNewAppPage() {
    router.push(`/apps/new`);
  }

  function deleteApp(id: number) {
    fetch(APPS_API_URL + id, {
      method: "DELETE",
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.message);
        });
      }
      
      mutate();
      
      setAlertMessage(`App with id '${id}' successfully deleted!`);
      setAlertSeverity("success");
      setShowAlert(true);

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while deleting app with id ${id}: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    });    
  }

  return (
    <>
      <Head>
        <title>OnLaunch</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className={styles.main}>
        <h1>Apps</h1>
        <div className="addButton">
            <Button
              variant="contained"
              onClick={() => {
                navigateToNewAppPage();
              }}
            >
              New App
            </Button>
          </div>
        <Table sx={{ minWidth: 650, maxWidth: 1000 }} aria-label="simple table">
          <TableHead>
            <TableCell width="5%">
              <strong>ID</strong>
            </TableCell>
            <TableCell>
              <strong>App Name</strong>
            </TableCell>
            <TableCell width="5%"></TableCell>
          </TableHead>
          <TableBody>
            {data.map((app, index) => {
              return (
                <TableRow key={index} >
                  <TableCell width="5%">
                    {app.id}
                  </TableCell>
                  <TableCell>
                    {app.name}
                  </TableCell>
                  <TableCell width="5%">
                      <div className="hiddenTableElement">
                        <IconButton onClick={() => navigateToMessagesPage(app.id)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton onClick={() => navigateToEditAppPage(app.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => deleteApp(app.id)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {data.length == 0 && (
          <p className="marginTopMedium">no data to show</p>
        )}
        <Snackbar 
            open={showAlert} 
            autoHideDuration={6000} 
            onClose={() => setShowAlert(false)}
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
            <Alert
              className="marginTopMedium"
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
    </>
  );
}
