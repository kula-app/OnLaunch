"use client";

import { getApps } from "@/app/actions/get-apps";
import { getAuthenticatedUserRoleInOrg } from "@/app/actions/get-authenticated-user-role-in-org";
import { getOrg } from "@/app/actions/get-org";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import { OrgRole } from "@/models/org-role";
import Routes from "@/routes/routes";
import { rainbowColors } from "@/theme/rainbow-colors";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Spacer,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { notFound, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaArrowRight, FaGear } from "react-icons/fa6";
import { OrgCard } from "../_components/org-card";
import { OrgMetrics } from "./_components/org-metrics";
import { AppCard } from "./apps/_components/app-card";

export const UI: React.FC<{ orgId: number }> = ({ orgId }) => {
  const router = useRouter();
  const toast = useToast();

  const [isLoadingOrg, setIsLoadingOrg] = useState(false);
  const [org, setOrg] = useState<Org | null>(null);
  const fetchOrg = useCallback(async () => {
    setIsLoadingOrg(true);
    try {
      const response = await getOrg(orgId);
      if (response.error) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setOrg(response.value ?? null);
      if (!response.value) {
        notFound();
      }
    } catch (error: any) {
      toast({
        title: "Failed to fetch organization",
        description: error.message,
        status: "error",
      });
    }
    setIsLoadingOrg(false);
  }, [orgId, toast, setOrg]);
  useEffect(() => {
    if (!org) {
      fetchOrg();
    }
  }, [fetchOrg, org]);

  const [authenticatedUserRole, setAuthenticatedUserRole] =
    useState<OrgRole | null>(null);
  const fetchAuthenticatedUserRole = useCallback(async () => {
    try {
      const response = await getAuthenticatedUserRoleInOrg(orgId);
      if (response.error) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setAuthenticatedUserRole(response.value);
    } catch (error: any) {
      toast({
        title: "Failed to fetch authenticated user role",
        description: error.message,
        status: "error",
      });
    }
  }, [orgId, toast]);
  useEffect(() => {
    if (!authenticatedUserRole) {
      fetchAuthenticatedUserRole();
    }
  }, [fetchAuthenticatedUserRole, authenticatedUserRole]);

  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [apps, setApps] = useState<App[] | null>(null);
  const fetchApps = useCallback(async () => {
    setIsLoadingApps(true);
    try {
      const response = await getApps(orgId);
      if (response.error) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setApps(response.value);
    } catch (error: any) {
      toast({
        title: "Failed to fetch apps",
        description: error.message,
        status: "error",
      });
    }
    setIsLoadingApps(false);
  }, [orgId, toast]);
  useEffect(() => {
    if (!apps) {
      fetchApps();
    }
  }, [fetchApps, apps]);

  const visibleAppsCount = authenticatedUserRole === OrgRole.ADMIN ? 2 : 3;
  return (
    <Flex direction={"column"} minH={"100vh"}>
      <ConfiguredNavigationBar
        items={[{ kind: "orgs" }, { kind: "org", orgId }]}
      />

      <Container maxW={"6xl"}>
        <VStack p={4} w={"full"} gap={8}>
          {isLoadingOrg ? (
            <CircularProgress isIndeterminate color={"blue.300"} />
          ) : (
            <>
              <HStack w={"full"}>
                <Heading size={"lg"} as={"h1"} color={"white"} mb={4}>
                  Organization &lsquo;{org?.name}&rsquo;
                </Heading>
                <Spacer />
                <IconButton
                  icon={<FaGear />}
                  onClick={() => router.push(Routes.orgSettings({ orgId }))}
                  aria-label={"Settings"}
                />
              </HStack>
              <Box w={"full"}>
                <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
                  Recently used apps
                </Heading>
                <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                  {authenticatedUserRole === OrgRole.ADMIN && (
                    <GridItem key={"create"}>
                      <OrgCard
                        id={-1}
                        name="Create App"
                        type="create"
                        bg="gray.200"
                        color={"gray.600"}
                      />
                    </GridItem>
                  )}
                  {(apps ?? []).slice(0, visibleAppsCount).map((app, index) => (
                    <GridItem key={app.id}>
                      <AppCard
                        orgId={orgId}
                        appId={app.id}
                        name={app.name}
                        bg={rainbowColors[index % rainbowColors.length]}
                        color={"white"}
                      />
                    </GridItem>
                  ))}
                  {isLoadingApps && (
                    <GridItem key={"loading"}>
                      <Flex h={"full"} align={"center"}>
                        <CircularProgress isIndeterminate size={8} />
                      </Flex>
                    </GridItem>
                  )}
                  <GridItem
                    key={"more"}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"start"}
                  >
                    <Button
                      onClick={() => router.push(Routes.apps({ orgId }))}
                      colorScheme={"gray"}
                      variant={"ghost"}
                      rightIcon={<FaArrowRight />}
                      color={"white"}
                    >
                      View all apps
                    </Button>
                  </GridItem>
                </Grid>
              </Box>
              {authenticatedUserRole === OrgRole.ADMIN && (
                <>
                  <Box w={"full"}>
                    <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
                      App request in the past days
                    </Heading>
                    <OrgMetrics orgId={orgId} />
                  </Box>
                </>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Flex>
  );
};
