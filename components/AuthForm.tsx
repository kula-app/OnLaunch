import { useState, FormEvent } from 'react';
import styles from "../styles/Home.module.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { signIn } from 'next-auth/react';
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import type { AlertColor } from '@mui/material/Alert';
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/router";

const USER_API_URL = "/api/frontend/v0.1/users/";

async function createUser(email: string, password: string, firstName: string, lastName: string) {
    const response = await fetch(USER_API_URL, {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
        headers: {
            'Content-Type':  'application/json'
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error (data.message || 'an error occurred');
    }

    return data;
}

export default function AuthForm() {
    const router = useRouter();
    
    const [isLoginMode, setIsLoginMode] = useState(true);
    const[email, setEmail] = useState("");
    const[firstName, setFirstName] = useState("");
    const[lastName, setLastName] = useState("");
    const[password, setPassword] = useState("");

    const [showAlert, setShowAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");
    const [alertMessage, setAlertMessage] = useState("");

    function switchLoginMode() {
        setIsLoginMode((prevState) => !prevState);
    }
    
    function navigateToAppsPage() {
        router.replace(`/`);
    } 
    
    function navigateToVerifyPage() {
        router.replace(`/verify?signup=true`);
    } 

    async function submitHandler(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isLoginMode) {
            const result = await signIn('credentials', { 
                redirect: false,
                email: email,
                password: password,
            })
            if (result && result.error) {
                if (result.error === "Verify account!") {
                    navigateToVerifyPage();
                }
                setAlertMessage(`Error while logging in: ${result.error}`);
                setAlertSeverity("error");
                setShowAlert(true);
            } else {
                navigateToAppsPage();
            }
        } else {
            try {
                const result = await createUser(email, password, firstName, lastName);

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
                <h1>{isLoginMode ? 'Login' : 'Sign up'}</h1>
                <form
                    className="column"
                    onSubmit={submitHandler}
                >
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
                    { !isLoginMode && <TextField 
                        required 
                        label="First name"
                        id="firstName" 
                        className="marginTopMedium"
                        onChange={(event) => setFirstName(event.target.value)}
                    /> 
                    }
                    { !isLoginMode && <TextField 
                        required 
                        label="Last name"
                        id="lastName" 
                        className="marginTopMedium"
                        onChange={(event) => setLastName(event.target.value)}
                    /> 
                    }
                    <Button 
                        variant="contained" 
                        type="submit"
                        className="marginTopMedium"
                    >
                        {isLoginMode ? 'login' : 'create account'}
                    </Button>
                    <Button 
                        variant="text" 
                        type="button"
                        className="marginTopMedium"
                        onClick={() => switchLoginMode()}
                    >
                        {isLoginMode ? 'create new account' : 'log in with existing account'}
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
        </>
    )
}