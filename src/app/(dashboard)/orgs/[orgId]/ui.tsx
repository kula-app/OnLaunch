"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { useApps } from "@/hooks/use-apps";
import { useAuthenticatedUserRole } from "@/hooks/use-authenticated-user-role";
import { useOrg } from "@/hooks/use-org";
import { OrgRole } from "@/models/org-role";
import { Routes } from "@/routes/routes";
import { rainbowColors } from "@/theme/rainbow-colors";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Skeleton,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaGear } from "react-icons/fa6";
import { OrgCard } from "../_components/org-card";
import { OrgMetrics } from "./_components/org-metrics";
import { AppCard } from "./apps/_components/app-card";

export const UI: React.FC<{ orgId: number }> = ({ orgId }) => {
  const router = useRouter();

  const { org, isLoading: isLoadingOrg, error: orgError } = useOrg({ orgId });
  const {
    role: authenticatedUserRole,
    error: authenticatedUserRoleError,
    isLoading: isLoadingAuthenticatedUserRole,
  } = useAuthenticatedUserRole({ orgId });
  const {
    apps,
    isLoading: isLoadingApps,
    error: appsError,
  } = useApps({ orgId });

  const visibleAppsCount = authenticatedUserRole === OrgRole.ADMIN ? 2 : 3;
  return (
    <Flex direction={"column"} minH={"100vh"}>
      <ConfiguredNavigationBar
        items={[{ kind: "orgs" }, { kind: "org", orgId }]}
      />

      <Container maxW={"6xl"}>
        <VStack p={4} w={"full"} gap={8}>
          <HStack w={"full"}>
            <Heading size={"lg"} as={"h1"} color={"white"} mb={4}>
              <Skeleton
                isLoaded={!isLoadingOrg && !isLoadingAuthenticatedUserRole}
              >
                Organization &lsquo;{org?.name}&rsquo;
              </Skeleton>
            </Heading>
            <Spacer />
            {org?.subName == "free" && (
              <Button
                onClick={() =>
                  router.push(Routes.upgradeOrganization({ orgId }))
                }
                colorScheme={"orange"}
                leftIcon={<>✨</>}
              >
                Upgrade Plan
              </Button>
            )}
            <IconButton
              icon={<FaGear />}
              onClick={() =>
                router.push(Routes.organizationSettings({ orgId }))
              }
              aria-label={"Settings"}
            />
          </HStack>
          {(orgError || authenticatedUserRoleError) && (
            <Alert status={"error"} w={"full"}>
              <AlertIcon />
              <AlertTitle>Failed to load organisation!</AlertTitle>
              <AlertDescription>
                {(orgError ?? authenticatedUserRoleError)?.message}
              </AlertDescription>
            </Alert>
          )}
          <Box w={"full"}>
            <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
              Recently used apps
            </Heading>
            {appsError && (
              <Alert status={"error"} w={"full"}>
                <AlertIcon />
                <AlertTitle>Failed to load apps!</AlertTitle>
                <AlertDescription>{appsError.message}</AlertDescription>
              </Alert>
            )}
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
                  <Skeleton h={"full"} w={"full"}>
                    <AppCard
                      orgId={-1}
                      appId={-1}
                      name={""}
                      bg={"gray.200"}
                      color={"white"}
                    />
                  </Skeleton>
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
        </VStack>
      </Container>
    </Flex>
  );
};
