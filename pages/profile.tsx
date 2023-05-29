import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import createEmailChangeToken from "../api/tokens/createEmailChangeToken";
import deleteUser from "../api/users/deleteUser";
import getUser from "../api/users/getUser";
import updatePassword from "../api/tokens/updatePassword";
import { User } from "../models/user";
import {
  Button,
  Input,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import React from "react";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const [user, setUser] = useState<Partial<User>>();

  const [passwordOld, setPasswordOld] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [emailNew, setEmailNew] = useState("");
  const [displayEmailMessage, setDisplayEmailMessage] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchUserData = async () => {
      try {
        setUser(await getUser());
      } catch (error) {
        toast({
          title: "Error while fetching user data!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    };

    fetchUserData();
  }, [router.isReady, toast]);

  async function sendNewPassword() {
    if (password === passwordConfirmation) {
      try {
        await updatePassword(password, passwordOld);

        setPasswordOld("");
        setPassword("");
        setPasswordConfirmation("");

        toast({
          title: "Success!",
          description: "Password changed.",
          status: "success",
          isClosable: true,
          duration: 6000,
        });
      } catch (error) {
        toast({
          title: "Error!",
          description: "The passwords do not match.",
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    }
  }

  async function sendNewEmail() {
    if (user?.email === emailNew) {
      toast({
        title: "Error!",
        description: "This is the same as your current email address.",
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    } else {
      try {
        await createEmailChangeToken(emailNew);

        setEmailNew("");
        setDisplayEmailMessage(true);

        toast({
          title: "Success!",
          description: "Please check your mails.",
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      } catch (error) {
        toast({
          title: "Error while sending request!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    }
  }

  function openDeleteDialog() {
    onOpen();
  }

  async function sendDeleteProfile() {
    try {
      await deleteUser();

      signOut();
    } catch (error) {
      toast({
        title: "Error while sending request!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  return (
    <>
      <main className={styles.main}>
        <h1>Hello, {user?.firstName}!</h1>
        <div className="marginTopMedium column">
          <h2 className="centeredElement">Change email</h2>
          <div className="marginTopMedium centeredElement">
            Your email: {user?.email}
          </div>
          <label>
            Email
            <Input
              required
              id="email"
              className="marginTopMedium"
              value={emailNew}
              onChange={(event) => setEmailNew(event.target.value)}
            />
          </label>
          <Button
            color="info"
            sx={{ marginTop: 5 }}
            onClick={() => sendNewEmail()}
          >
            change email
          </Button>
          {displayEmailMessage && (
            <div className="marginTopMedium">
              We have sent a mail <br />
              to your new email <br />
              address, please check <br />
              and verify your <br />
              new address!
            </div>
          )}
        </div>
        <div className="marginTopLarge column">
          <h2>Change password</h2>
          <label>
            Current Password
            <Input
              required
              id="passwordOld"
              type="password"
              value={passwordOld}
              className="marginTopMedium"
              onChange={(event) => setPasswordOld(event.target.value)}
            />
          </label>
          <label>
            New Password
            <Input
              required
              id="password"
              type="password"
              value={password}
              className="marginTopMedium"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label>
            New Password (repeat)
            <Input
              required
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              className="marginTopMedium"
              onChange={(event) => setPasswordConfirmation(event.target.value)}
            />
          </label>
          <Button
            color="info"
            sx={{ marginTop: 5 }}
            onClick={() => sendNewPassword()}
          >
            change password
          </Button>
        </div>
        <div className="marginTopLarge column">
          <h2>Delete profile</h2>
          <Button
            colorScheme="red"
            sx={{ marginTop: 5 }}
            onClick={() => openDeleteDialog()}
          >
            delete
          </Button>
        </div>
      </main>
      <AlertDialog
        isOpen={isOpen}
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>{"Deletion of your profile"}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>Deletion cannot be undone.</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {sendDeleteProfile(); onClose()}}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
