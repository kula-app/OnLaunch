import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../../../../styles/Home.module.css";
import { getSession } from "next-auth/react";
import getApp from "../../../../../api/apps/getApp";
import updateApp from "../../../../../api/apps/updateApp";
import Routes from "../../../../../routes/routes";
import { App } from "../../../../../models/app";
import deleteApp from "../../../../../api/apps/deleteApp";
import {
  Input,
  Button,
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

export default function EditAppPage() {
  const router = useRouter();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const orgId = Number(router.query.orgId);
  const appId = Number(router.query.appId);

  const [appName, setAppName] = useState("");

  const [appKey, setAppKey] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const fetchAppData = async () => {
      try {
        const app = await getApp(orgId, appId);
        setAppKey(app.publicKey);

        if (app.role !== "ADMIN") {
          router.push(Routes.DASHBOARD);
        } else {
          fillForm(app);
        }
      } catch (error) {
        toast({
          title: "Error while fetching app data!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    };

    fetchAppData();
  }, [router.isReady, router, appId, orgId, toast]);

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateApp(orgId, appId, appName);

      toast({
        title: "Success!",
        description: "App has been edited.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      navigateToAppDetailPage();
    } catch (error) {
      toast({
        title: "Error while editing app!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function navigateToAppDetailPage() {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }

  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(Number(orgId)));
  }

  function fillForm(app: App) {
    // fill the form
    setAppName(app.name);
  }

  function handleDelete() {
    onOpen();
  }

  async function callDeleteApp() {
    try {
      await deleteApp(orgId, appId);

      toast({
        title: "Success!",
        description: `App with id '${appId}'has been deleted.`,
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      navigateToAppsPage();
    } catch (error) {
      toast({
        title: `Error while deleting app with id ${appId}!`,
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <h1>Edit App</h1>
          <form id="appForm" onSubmit={submitHandler}>
            <label>
              Name
              <Input
                required
                id="name"
                value={appName}
                onChange={(event) => setAppName(event.target.value)}
              />
            </label>
            <Button type="submit">update</Button>
          </form>
          <h1>Client API Key</h1>
          <div>
            <label>
              Public Key for Clients
              <Input disabled id="publicKey" value={appKey} />
            </label>
            <Button
              sx={{ marginLeft: 2 }}
              onClick={() => {
                navigator.clipboard.writeText(appKey as string);
                toast({
                  title: "Success!",
                  description: "Public key copied to clipboard.",
                  status: "success",
                  isClosable: true,
                  duration: 6000,
                });
              }}
            >
              copy
            </Button>
          </div>
          <div>
            <h1>Delete App</h1>
            <Button colorScheme="red" onClick={() => handleDelete()}>
              delete
            </Button>
          </div>
          <AlertDialog
            isOpen={isOpen}
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isCentered
          >
            <AlertDialogOverlay />

            <AlertDialogContent>
              <AlertDialogHeader>
                {`Delete App with id '${appId}?`}
              </AlertDialogHeader>
              <AlertDialogCloseButton />
              <AlertDialogBody>
                This cannot be undone and restoring the api key is not possible.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  ml={3}
                  onClick={() => {
                    callDeleteApp();
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
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
