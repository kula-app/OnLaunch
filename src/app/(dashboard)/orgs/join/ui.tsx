"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { CustomErrorNames } from "@/errors/custom-error-names";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import Routes from "@/routes/routes";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CircularProgress,
  Flex,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDirectInviteByToken } from "./actions/get-direct-invite-by-token";
import { getInviteByToken } from "./actions/get-invite-by-token";
import { joinOrgWithDirectInvite } from "./actions/join-org-with-direct-invite";
import { joinOrgWithInvite } from "./actions/join-org-with-invite";

export const UI: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  const [isAccepting, setIsAccepting] = useState(false);
  const [org, setOrg] = useState<Pick<Org, "id" | "name"> | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const inviteToken = searchParams?.get("invite-token");
  const directInviteToken = searchParams?.get("direct-invite-token");

  async function acceptUserInvitation(token: string) {
    const result = await joinOrgWithDirectInvite(token);
    if (result.error) {
      throw new ServerError(result.error.name, result.error.message);
    }
    return result.value.id;
  }

  async function acceptOrgInvitation(token: string) {
    const result = await joinOrgWithInvite(token);
    if (result.error) {
      throw new ServerError(result.error.name, result.error.message);
    }
    return result.value.id;
  }

  async function acceptInvitation(orgId: number) {
    setIsAccepting(true);
    try {
      let joinedOrgId: number | null = null;
      if (inviteToken) {
        joinedOrgId = await acceptOrgInvitation(inviteToken);
      } else if (directInviteToken) {
        joinedOrgId = await acceptUserInvitation(directInviteToken);
      } else {
        return;
      }

      toast({
        title: "Success!",
        description: `You joined the organisation.`,
        status: "success",
        isClosable: true,
        duration: 6000,
      });
      router.push(
        Routes.org({
          orgId: joinedOrgId,
          reason: "user-joined",
        }),
      );
    } catch (error: any) {
      if (error.name === CustomErrorNames.UserAlreadyJoinedOrgError) {
        toast({
          title: "You already joined this organisation!",
          description: "Redirecting...",
          status: "info",
        });
        router.push(
          Routes.org({
            orgId: orgId,
          }),
        );
      } else {
        toast({
          title: "Failed to accept invitation",
          description: error.message,
          status: "error",
        });
      }
    }
    setIsAccepting(false);
  }

  useEffect(() => {
    async function fetchInviteByToken(token: string) {
      try {
        const result = await getInviteByToken(token);
        if (result.error) {
          throw new ServerError(result.error.name, result.error.message);
        }
        setOrg(result.value);
        setFetchError(null);
      } catch (error: any) {
        setOrg(null);
        setFetchError(error.message);
        toast({
          title: "Failed to fetch invite",
          description: error.message,
          status: "error",
        });
      }
    }

    async function fetchDirectInviteByToken(token: string) {
      try {
        const result = await getDirectInviteByToken(token);
        if (result.error) {
          throw new ServerError(result.error.name, result.error.message);
        }
        setOrg(result.value);
        setFetchError(null);
      } catch (error: any) {
        setOrg(null);
        setFetchError(error.message);
        toast({
          title: "Failed to fetch invite",
          description: error.message,
          status: "error",
        });
      }
    }

    if (inviteToken) {
      fetchInviteByToken(inviteToken);
    } else if (directInviteToken) {
      fetchDirectInviteByToken(directInviteToken);
    }
  }, [inviteToken, directInviteToken, toast]);

  return (
    <Flex
      direction={"column"}
      align={"stretch"}
      minH={{ base: 0, sm: "100vh" }}
    >
      <ConfiguredNavigationBar items={[]} />
      <Flex
        direction={"column"}
        justifyContent={{ base: "start", sm: "center" }}
        alignItems={"center"}
        flex={1} // Setting flex to 1 to make the flex item grow and take up the remaining space
        mt={{ base: 12, md: 0 }}
        px={{ base: 4, md: 0 }}
      >
        <Flex direction={"column"} justifyContent={"center"}>
          <Card mt={{ base: 12, sm: "48px" }} p={2}>
            {fetchError ? (
              <CardBody>
                <Text color={"white"}>{fetchError}</Text>
              </CardBody>
            ) : org ? (
              <>
                <CardHeader>
                  <Heading size="md" color="white">
                    Join Organization {org.name}
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text color={"white"}>
                    You are invited to join the organization &apos;{org.name}
                    &apos;.
                    <br />
                    Click on the button below to accept.
                    <br />
                    You can leave at any time.
                  </Text>
                </CardBody>
                <CardFooter
                  display={"flex"}
                  flexDirection={"column"}
                  alignItems={"end"}
                >
                  <ButtonGroup spacing="2">
                    <Button
                      variant="solid"
                      colorScheme="gray"
                      onClick={() => router.push(Routes.dashboard)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="solid"
                      colorScheme="green"
                      onClick={() => acceptInvitation(org.id)}
                      isLoading={isAccepting}
                    >
                      Accept
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </>
            ) : (
              <>
                <CardBody>
                  <CircularProgress isIndeterminate size={8} />
                </CardBody>
              </>
            )}
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
};
