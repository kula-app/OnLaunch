import { useState, FormEvent } from "react";
import styles from "../styles/Home.module.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { signIn } from "next-auth/react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from "@mui/material/Alert";
import { MdClose } from "react-icons/md";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/router";
import Routes from "../routes/routes";
import signupUser from "../api/users/signupUser";

export default function AuthForm() {
  const router = useRouter();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
  const [alertMessage, setAlertMessage] = useState("");

  function switchLoginMode() {
    setIsLoginMode((prevState) => !prevState);
  }

  function navigateToHomePage() {
    router.replace(Routes.INDEX);
  }

  function navigateToPasswordResetPage() {
    router.replace(Routes.RESET);
  }

  function navigateToVerifyPage() {
    router.replace(Routes.VERIFY_AFTER_SIGNUP);
  }

  function navigateToVerifyPageWithEmail(email: string) {
    router.replace(Routes.getVerifyWithEmail(email));
  } 

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoginMode) {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      });
      if (result && result.error) {
        if (result.error === "Verify account!") {
          navigateToVerifyPageWithEmail(email);
        }
        setAlertMessage(`Error while logging in: ${result.error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      } else {
        navigateToHomePage();
      }
    } else {
      try {
        await signupUser(email, password, firstName, lastName);
        navigateToVerifyPage();
      } catch (error) {
        setAlertMessage(`Error while creating user: ${error}`);
        setAlertSeverity("error");
        setShowAlert(true);
      }
    }
  }

  return (
    <>
      <main className={styles.main}>
        <h1>{isLoginMode ? "Login" : "Sign up"}</h1>
        <form className="column" onSubmit={submitHandler}>
          <TextField
            required
            label="Email"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            required
            label="Password"
            id="password"
            type="password"
            className="marginTopMedium"
            onChange={(event) => setPassword(event.target.value)}
          />
          {!isLoginMode && (
            <TextField
              required
              label="First name"
              id="firstName"
              className="marginTopMedium"
              onChange={(event) => setFirstName(event.target.value)}
            />
          )}
          {!isLoginMode && (
            <TextField
              required
              label="Last name"
              id="lastName"
              className="marginTopMedium"
              onChange={(event) => setLastName(event.target.value)}
            />
          )}
          <Button variant="contained" type="submit" className="marginTopMedium">
            {isLoginMode ? "login" : "create account"}
          </Button>
          <Button
            variant="text"
            type="button"
            className="marginTopMedium"
            onClick={() => switchLoginMode()}
          >
            {isLoginMode
              ? "create new account"
              : "log in with existing account"}
          </Button>
          {isLoginMode && (
            <Button
              variant="text"
              type="button"
              onClick={() => navigateToPasswordResetPage()}
            >
              Forgot Password
            </Button>
          )}
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
                <MdClose fontSize="inherit" />
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
