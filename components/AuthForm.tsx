import { useState, FormEvent } from "react";
import styles from "../styles/Home.module.css";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Routes from "../routes/routes";
import signupUser from "../api/users/signupUser";
import {
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";

export default function AuthForm() {
  const router = useRouter();
  const toast = useToast();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

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

        toast({
          title: 'Error while logging in!',
          description: `${result.error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      } else {
        navigateToHomePage();
      }
    } else {
      try {
        await signupUser(email, password, firstName, lastName);
        navigateToVerifyPage();
      } catch (error) {
        toast({
          title: 'Error while creating user',
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    }
  }

  return (
    <>
      <main className={styles.main}>
        <h1>{isLoginMode ? "Login" : "Sign up"}</h1>
        <form onSubmit={submitHandler}>
          <label>
            Email
            <Input
              required
              id="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <Input
              required
              id="password"
              type="password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {!isLoginMode && (
            <label>
              First name
              <Input
                required
                id="firstName"
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>
          )}
          {!isLoginMode && (
            <label>
              Last name
              <Input
                required
                id="lastName"
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
          )}
          <Button colorScheme="blue" type="submit">
            {isLoginMode ? "login" : "create account"}
          </Button>
          <Button
            variant="text"
            type="button"
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
              forgot password
            </Button>
          )}
        </form>
      </main>
    </>
  );
}
