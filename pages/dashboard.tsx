import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Heading,
  Skeleton,
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useOrgs } from "../api/orgs/useOrgs";
import getDirectInviteToken from "../api/tokens/getDirectInviteToken";
import getOrgInviteToken from "../api/tokens/getOrgInviteToken";
import joinOrgViaDirectInvite from "../api/tokens/joinOrgViaDirectInvite";
import joinOrgViaOrgInvite from "../api/tokens/joinOrgViaOrgInvite";
import { loadClientConfig } from "../config/loadClientConfig";
import { OrgInvite } from "../models/orgInvite";
import Routes from "../routes/routes";
import styles from "../styles/Home.module.css";
import { getColorLabel, translateSubName } from "../util/nameTag";

export default function DashboardPage() {
  const router = useRouter();
  const stripeConfig = loadClientConfig().stripeConfig;

  const { invite, directinvite } = router.query;

  const [orgInvite, setOrgInvite] = useState<OrgInvite>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const toast = useToast();

  useEffect(() => {
    if (!router.isReady) return;
    async function showInvitation() {
      try {
        if (!!invite) {
          setOrgInvite(await getOrgInviteToken(invite as string));
          onOpen();
        } else if (!!directinvite) {
          setOrgInvite(await getDirectInviteToken(directinvite as string));
          onOpen();
        }
      } catch (error) {
        toast({
          title: "Error while joining organisation!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    }
    if (!!invite || !!directinvite) {
      showInvitation();
    }
  }, [router.isReady, invite, directinvite, toast, onOpen]);

  function navigateToAppsPage(id: number) {
    router.push(Routes.getOrgAppsByOrgId(id));
  }

  // Fetch the organizations
  const { orgs, isLoading, isError } = useOrgs();
  useEffect(() => {
    // If there are no organizations, navigate to the new org page
    if (orgs && orgs.length === 0) {
      navigateToNewOrgPage();
    }
  });
  if (isError) return <div>Failed to load</div>;

  function navigateToNewOrgPage() {
    router.push(Routes.createNewOrg);
  }

  function navigateToOrgPage(orgId: number) {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  }

  async function joinOrg(id: number) {
    try {
      if (!!invite) {
        await joinOrgViaOrgInvite(invite as string);
      } else if (!!directinvite) {
        await joinOrgViaDirectInvite(directinvite as string);
      }
      if (!!invite || !!directinvite) {
        toast({
          title: "Success!",
          description: `Joined organisation with id ${id}`,
          status: "success",
          isClosable: true,
          duration: 6000,
        });

        navigateToOrgPage(id);
      }
    } catch (error) {
      toast({
        title: "Error while joining!",
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
        <Heading className="text-center">Organisations</Heading>
        <div>
          <Button
            className="mt-8"
            colorScheme="blue"
            onClick={navigateToNewOrgPage}
          >
            New Organisation
          </Button>
        </div>
        <div className="min-w-min">
          <Table
            className="mt-8"
            sx={{ minWidth: 650, maxWidth: 1000 }}
            aria-label="table"
          >
            <Thead>
              <Tr>
                <Th width="5%">
                  <strong>ID</strong>
                </Th>
                <Th>
                  <strong>Name</strong>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {orgs?.map((org, index) => {
                return (
                  <Tr
                    className="clickable-row h-16"
                    key={index}
                    onClick={() => navigateToAppsPage(org.id)}
                  >
                    <Td width="5%">{org.id}</Td>
                    <Td>
                      {org.name}
                      {stripeConfig.isEnabled && (
                        <Tag
                          className="whitespace-nowrap flex-shrink-0 justify-center ml-2"
                          size={"md"}
                          key={index}
                          borderRadius="full"
                          variant="solid"
                          colorScheme={getColorLabel(org?.subName)}
                        >
                          {translateSubName(org?.subName)}
                        </Tag>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          {isLoading && (
            <div className="w-full">
              <Stack>
                <Skeleton height="60px" />
                <Skeleton height="60px" />
                <Skeleton height="60px" />
              </Stack>
            </div>
          )}
        </div>
        {orgs?.length == 0 && <p className="mt-4">no data to show</p>}

        <AlertDialog
          isOpen={isOpen}
          motionPreset="slideInBottom"
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          isCentered
        >
          <AlertDialogOverlay />

          <AlertDialogContent>
            <AlertDialogHeader>{`Join Organisation '${orgInvite?.name}?'`}</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>You can leave any time.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                ml={3}
                onClick={() => {
                  joinOrg(Number(orgInvite?.id));
                  onClose();
                }}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
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
