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
  Heading,
  FormLabel,
  FormControl,
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
          title: "Error while logging in!",
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
          title: "Error while creating user",
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
        <Heading className="text-center">
          {isLoginMode ? "Login" : "Sign up"}
        </Heading>
        <div style={{ width: 340 }} className="mt-8">
          <form onSubmit={submitHandler}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                required
                id="email"
                type="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormControl>
            <FormControl className="mt-4">
              <FormLabel>Password</FormLabel>
              <Input
                required
                id="password"
                type="password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormControl>
            {!isLoginMode && (
              <FormControl className="mt-4">
                <FormLabel>First name</FormLabel>
                <Input
                  required
                  id="firstName"
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </FormControl>
            )}
            {!isLoginMode && (
              <FormControl className="mt-4">
                <FormLabel>Last name</FormLabel>
                <Input
                  required
                  id="lastName"
                  onChange={(event) => setLastName(event.target.value)}
                />
              </FormControl>
            )}
            <div className="flex flex-col mt-8">
              <Button colorScheme="blue" type="submit">
                {isLoginMode ? "login" : "create account"}
              </Button>
              <Button
                variant="ghost"
                colorScheme="blue"
                type="button"
                onClick={switchLoginMode}
              >
                {isLoginMode
                  ? "create new account"
                  : "log in with existing account"}
              </Button>
              {isLoginMode && (
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  type="button"
                  onClick={navigateToPasswordResetPage}
                >
                  forgot password
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
