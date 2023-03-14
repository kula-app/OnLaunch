import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import { useSession, getSession, signOut } from 'next-auth/react';

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from '@mui/material/Alert';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// TODO: move interfaces into own files, if they are reused in multiple pages
interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export default function ProfilePage() {
  const router = useRouter();
  
  // TODO: status is unused
  const { data: session, status } = useSession();

  // TODO: These API URLs might be reused, move them to a shared class
  const USERS_API_URL = "/api/frontend/v0.1/users/";
  const PASSWORD_API_URL = "/api/frontend/v0.1/users/passwordChange";
  const EMAIL_API_URL = "/api/frontend/v0.1/users/emailChange";
  
  const [user, setUser] = useState<User>();

  const [passwordOld, setPasswordOld] = useState("");
  const [password, setPassword] = useState("");
  // TODO: use a good variable name like `confirmationPassword` or similar
  const [password2, setPassword2] = useState("");

  const [emailNew, setEmailNew] = useState("");
  const [displayEmailMessage, setDisplayEmailMessage] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // TODO: see `dashboard.tsx` for all the comments about API communication
    
  useEffect(() => {
    if (!router.isReady) return;

    fetch(USERS_API_URL)
    .then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        return response.json();
    })
    .then((data) => {
        let userData: User = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        };

        setUser(userData);
    })
    .catch(error => {
        setAlertMessage(`Error while fetching user data: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    });
  }, [router.isReady]);

  
  function sendNewPassword() {
    if (password === password2) {
      fetch(PASSWORD_API_URL, {
        method: "PUT",
        body: JSON.stringify({ password: password, passwordOld: passwordOld }),
        headers: {
            "Content-Type": "application/json",
        },
      }).then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        
        setPasswordOld("");
        setPassword("");
        setPassword2("");

        setAlertMessage("Password successfully changed!");
        setAlertSeverity("success");
        setShowAlert(true);
    
          return response.json();
      })
      .catch(error => {
        setAlertMessage(`Error while sending request: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }); 
    } else {
      setAlertMessage('The passwords do not match!');
      setAlertSeverity("error");
      setShowAlert(true);
    }
  }
  
  function sendNewEmail() {
    if (user?.email === emailNew) {
      setAlertMessage('This is the same as your current email address!');
      setAlertSeverity("error");
      setShowAlert(true);
    } else {
      fetch(EMAIL_API_URL, {
        method: "POST",
        body: JSON.stringify({ emailNew: emailNew }),
        headers: {
            "Content-Type": "application/json",
        },
      }).then((response) => {
        if(!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        
        setEmailNew("");
        setDisplayEmailMessage(true);

        setAlertMessage("You have got mail!");
        setAlertSeverity("success");
        setShowAlert(true);
    
        return response.json();
      })
      .catch(error => {
        setAlertMessage(`Error while sending request: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }); 
    }
  } 

  function openDeleteDialog() {
    setShowDeleteDialog(true);
  }

  function sendDeleteProfile() {
    fetch(USERS_API_URL, {
      method: "DELETE",
      headers: {
          "Content-Type": "application/json",
      },
    }).then(async (response) => {
      if(!response.ok) {
          return response.json().then(error => {
              throw new Error(error.message);
          });
      }

      signOut();

      return response.json();
    })
    .catch(error => {
      setAlertMessage(`Error while sending request: ${error.message}`);
      setAlertSeverity("error");
      setShowAlert(true);
    }); 
  }
    
  return (
    <>
      <Navbar hasSession={!!session} />
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
              id="password2"
              type="password" 
              value={password2}
              className="marginTopMedium"
              onChange={(event) => setPassword2(event.target.value)}
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