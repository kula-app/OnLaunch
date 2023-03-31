import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

import CloseIcon from "@mui/icons-material/Close";
import type { AlertColor } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import { getSession } from "next-auth/react";
import updateVerifiedStatus from "../api/updateVerifiedStatus";
import Routes from "../routes/routes";
import { useCallback } from "react";
import ApiRoutes from "../routes/apiRoutes";

export default function VerifyPage() {
  const router = useRouter();

  const { signup, token, email } = router.query;

  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [obsolete, setObsolete] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  const navigateToAuthPage = useCallback(() => {
    router.push(Routes.AUTH);
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!!token) {
      const verifyUser = async () => {
        await updateVerifiedStatus(token as string);

        setVerified(true);
      };

      try {
        verifyUser();
      } catch (error) {
        if ((error as string).includes("expired")) {
          setExpired(true);
        } else if ((error as string).includes("obsolete")) {
          setObsolete(true);
        } else {
          setAlertMessage(`Error while verifying: ${error}`);
          setAlertSeverity("error");
          setShowAlert(true);
        }
      }
    }
  }, [router.isReady, token, signup, navigateToAuthPage]);

  function resendLink() {
    fetch(ApiRoutes.VERIFICATION, {
      method: "POST",
      body: JSON.stringify({ email: email }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.message);
          });
        }

        setAlertMessage(`Link was successfully resend!`);
        setAlertSeverity("success");
        setShowAlert(true);

        return response.json();
      })
      .catch((error) => {
        setAlertMessage(`Error while resending link: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
      });

    setDisabled(true);
  }

  return (
    <>
      <main className={styles.main}>
        {((signup || email) && !expired) && <div>
          <h1 className="centeredElement">Verify your account</h1>
          <div>Please check your mails for the verification link!</div>
        </div>
        }
        {(verified && !expired) && <div className="centeredElement column">
          <h1 className="centeredElement">Thank you for verifying!</h1>
          <div>If you want to use the full functionality of OnLaunch please log in</div>
          <Button
              variant="contained"
              color="info"
              sx={{ marginTop: 5 }}
              onClick={() => navigateToAuthPage()}
            >
              login
            </Button>
          </div>
          }
        {(!signup && !verified && expired && !obsolete) && <div className="centeredElement column">
            <h1 className="centeredElement">Link is expired!</h1>
            <div>No worries, we already sent you a new one </div>
          </div>
        }{(!verified && !signup && !expired && !obsolete && !email) && <div>
          <h1>loading ...</h1>
        </div> 
        }
        {(!signup && !verified && !!email && !disabled) && 
          <Button 
            variant="contained" 
            type="button"
            className="marginTopMedium"
            onClick={() => resendLink()}
            >
              resend link
          </Button>
        }
        {(!signup && !verified && !!email && disabled) && 
          <Button 
            variant="contained" 
            type="button"
            className="marginTopMedium"
            disabled
            onClick={() => resendLink()}
            >
              resend link
          </Button>
        }
      </main>
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
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
