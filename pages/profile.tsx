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
  Text,
  Heading,
  FormControl,
  FormLabel,
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
          status: "success",
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
        <Heading className="text-center">Hello, {user?.firstName}!</Heading>
        <div>
          <Heading size="lg" className="text-center mt-16 mb-8">
            Change email
          </Heading>
          <div className="mb-2">
            Your email: <Text as="b">{user?.email}</Text>
          </div>
          <FormControl className="mt-4">
            <FormLabel>Email</FormLabel>
            <Input
              required
              id="email"
              type="email"
              value={emailNew}
              onChange={(event) => setEmailNew(event.target.value)}
            />
          </FormControl>
          <div className="flex justify-center">
            <Button
              colorScheme="blue"
              className="mt-4"
              onClick={() => sendNewEmail()}
            >
              change email
            </Button>
          </div>
          {displayEmailMessage && (
            <div className="mt-4" style={{ width: 250 }}>
              We have sent a mail to your new Email address, please check and
              verify your new address!
            </div>
          )}
        </div>
        <div style={{ width: 300 }}>
          <Heading size="lg" className="text-2xl font-bold text-center mt-16 mb-8">
            Change password
          </Heading>
          <FormControl className="mt-4">
            <FormLabel>Current password</FormLabel>
            <Input
              required
              id="passwordOld"
              type="password"
              value={passwordOld}
              onChange={(event) => setPasswordOld(event.target.value)}
            />
          </FormControl>
          <FormControl className="mt-4">
            <FormLabel>New password</FormLabel>
            <Input
              required
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormControl>
          <FormControl className="mt-4">
            <FormLabel>New password (repeat)</FormLabel>
            <Input
              className="mt-2"
              required
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
            />
          </FormControl>
          <div className="flex justify-center">
            <Button
              colorScheme="blue"
              className="mt-4"
              onClick={() => sendNewPassword()}
            >
              change password
            </Button>
          </div>
        </div>
        <div>
          <Heading size="lg" className="text-2xl font-bold text-center mt-16 mb-8">
            Delete profile
          </Heading>
          <div className="flex justify-center">
            <Button colorScheme="red" onClick={() => openDeleteDialog()}>
              delete
            </Button>
          </div>
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
              onClick={() => {
                sendDeleteProfile();
                onClose();
              }}
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
