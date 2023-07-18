import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import createEmailChangeToken from "../api/tokens/createEmailChangeToken";
import deleteUser from "../api/users/deleteUser";
import getUser from "../api/users/getUser";
import updatePassword from "../api/tokens/updatePassword";
import { User } from "../models/user";
import { FiExternalLink } from "react-icons/fi";
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
  Center,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Tag,
} from "@chakra-ui/react";
import React from "react";
import { Subscription } from "../models/subscription";
import getSubscriptions from "../api/stripe/getSubscriptions";
import createCustomerPortalSession from "../api/stripe/createCustomerPortalSession";

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<Partial<User>>();
  const [subs, setSubs] = useState<Subscription[]>();

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

    const fetchUserSubscriptions = async () => {
      try {
        setSubs(await getSubscriptions());
      } catch (error) {
        toast({
          title: "Error while fetching user data!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
      setLoading(false);
    };

    fetchUserSubscriptions();
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

  async function sendCreateCustomerPortalSession() {
    try {
      const data = await createCustomerPortalSession();
      window.location.assign(data);
    } catch (error) {
      toast({
        title: "Error while sending createCustomerPortalSession request!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
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
          <Center>
            <Button colorScheme="blue" className="mt-4" onClick={sendNewEmail}>
              change email
            </Button>
          </Center>
          {displayEmailMessage && (
            <div className="mt-4" style={{ width: 250 }}>
              We have sent a mail to your new Email address, please check and
              verify your new address!
            </div>
          )}
        </div>
        <div style={{ width: 300 }}>
          <Heading size="lg" className="text-center mt-16 mb-8">
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
          <Center>
            <Button
              colorScheme="blue"
              className="mt-4"
              onClick={sendNewPassword}
            >
              change password
            </Button>
          </Center>
        </div>
        <div>
          <Heading size="lg" className="text-center mt-16 mb-8">
            Your subscriptions
          </Heading>
          <Table
            className="mt-8"
            sx={{ minWidth: 650, maxWidth: 1000 }}
            aria-label="simple table"
          >
            <Thead>
              <Tr>
                <Th>
                  <strong>Org Id</strong>
                </Th>
                <Th>
                  <strong>Organisation</strong>
                </Th>
                <Th>
                  <strong>Subscription</strong>
                </Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {subs?.map((sub, index) => {
                return (
                  <Tr key={index}>
                    <Td>{sub.org.id}</Td>
                    <Td>{sub.org.name}</Td>
                    <Td>
                      <Tag
                        size={"md"}
                        key={index}
                        borderRadius="full"
                        variant="solid"
                        colorScheme={
                          sub.subName === "Premium" ? "purple" : "teal"
                        }
                      >
                        {sub.subName}
                      </Tag>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          {!loading && subs?.length != 0 && (
            <Center>
              <Button
                rightIcon={<FiExternalLink />}
                colorScheme="blue"
                variant="solid"
                className="mt-4"
                onClick={sendCreateCustomerPortalSession}
              >
                manage subscriptions
              </Button>
            </Center>
          )}
          {loading && (
            <div>
              <Heading className="text-center">loading ...</Heading>
              <Spinner />
            </div>
          )}
          {!loading && subs?.length == 0 && (
            <Center className="mt-4">no data to show</Center>
          )}
        </div>
        <div>
          <Heading size="lg" className="text-center mt-16 mb-8">
            Delete profile
          </Heading>
          <Center>
            <Button colorScheme="red" onClick={openDeleteDialog}>
              delete
            </Button>
          </Center>
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
