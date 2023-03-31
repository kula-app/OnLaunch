import { getSession, signOut } from 'next-auth/react';
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import styles from "../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import type { AlertColor } from '@mui/material/Alert';
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import createEmailChangeToken from "../api/createEmailChangeToken";
import deleteUser from "../api/deleteUser";
import getUser from "../api/getUser";
import updatePassword from "../api/updatePassword";
import { User } from "../models/user";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<Partial<User>>();

  const [passwordOld, setPasswordOld] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [emailNew, setEmailNew] = useState("");
  const [displayEmailMessage, setDisplayEmailMessage] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchUserData = async () => {
      setUser(await getUser());
    } 

    try {
      fetchUserData();
    } catch(error) {
      setAlertMessage(`Error while fetching user data: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }, [router.isReady]);

  
  async function sendNewPassword() {
    if (password === passwordConfirmation) {
      try {
        await updatePassword(password, passwordOld);
  
        setPasswordOld("");
        setPassword("");
        setPasswordConfirmation("");

        setAlertMessage("Password successfully changed!");
        setAlertSeverity("success");
        setShowAlert(true);
      } catch(error) {
        setAlertMessage('The passwords do not match!');
        setAlertSeverity("error");
        setShowAlert(true);
      }
    }
  }
  
  async function sendNewEmail() {
    if (user?.email === emailNew) {
      setAlertMessage('This is the same as your current email address!');
      setAlertSeverity("error");
      setShowAlert(true);
    } else {
      try {
        await createEmailChangeToken(emailNew);
  
        setEmailNew("");
        setDisplayEmailMessage(true);

        setAlertMessage("You have got mail!");
        setAlertSeverity("success");
        setShowAlert(true);
      } catch(error) {
        setAlertMessage(`Error while sending request: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    }
  } 

  function openDeleteDialog() {
    setShowDeleteDialog(true);
  }

  async function sendDeleteProfile() {
    try {
      await deleteUser();

      signOut();
    } catch(error) {
      setAlertMessage(`Error while sending request: ${error}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }
    
  return (
    <>
      <main className={styles.main}>
        <h1>Hello, {user?.firstName}!</h1>
        <div className="marginTopMedium column">
          <h2 className="centeredElement">Change email</h2>
          <div className="marginTopMedium centeredElement">Your email: {user?.email}</div>
          <TextField 
            required 
            label="Email"
            id="email" 
            className="marginTopMedium"
            value={emailNew}
            onChange={(event) => setEmailNew(event.target.value)}
          />
          <Button
            variant="contained"
            color="info"
            sx={{ marginTop: 5 }}
            onClick={() => sendNewEmail()}
          >
            change email
          </Button>
          {displayEmailMessage && <div className="marginTopMedium">
            We have sent a mail <br/>to your new email <br/>address, please check <br/>and verify your <br/>new address!
          </div>
          }
        </div>
        <div className="marginTopLarge column">
          <h2>Change password</h2>
          <TextField 
              required 
              label="Current Password"
              id="passwordOld"
              type="password" 
              value={passwordOld}
              className="marginTopMedium"
              onChange={(event) => setPasswordOld(event.target.value)}
          />
          <TextField 
              required 
              label="New Password"
              id="password"
              type="password" 
              value={password}
              className="marginTopMedium"
              onChange={(event) => setPassword(event.target.value)}
          />
          <TextField 
              required 
              label="New Password (repeat)"
              id="passwordConfirmation"
              type="password" 
              value={passwordConfirmation}
              className="marginTopMedium"
              onChange={(event) => setPasswordConfirmation(event.target.value)}
          />
          <Button
            variant="contained"
            color="info"
            sx={{ marginTop: 5 }}
            onClick={() => sendNewPassword()}
          >
            change password
          </Button>
        </div>
        <div className="marginTopLarge column">
          <h2 >Delete profile</h2>
          <Button
            variant="contained"
            color="error"
            sx={{ marginTop: 5 }}
            onClick={() => openDeleteDialog()}
          >
            delete
          </Button>
        </div>
      </main>
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
      <Dialog
        open={showDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
          {'Deletion of your profile'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deletion cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={() => {setShowDeleteDialog(false); sendDeleteProfile()}} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
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