"use client";

import { getApps } from "@/app/actions/get-apps";
import { getAuthenticatedUserRoleInOrg } from "@/app/actions/get-authenticated-user-role-in-org";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import { OrgRole } from "@/models/org-role";
import Routes from "@/routes/routes";
import { rainbowColors } from "@/theme/rainbow-colors";
import {
  Box,
  CircularProgress,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { AppCard } from "./_components/app-card";

export const UI: React.FC<{ orgId: number }> = ({ orgId }) => {
  const router = useRouter();
  const toast = useToast();

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
  }, [authenticatedUserRole, fetchAuthenticatedUserRole]);

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
    } else if (apps.length === 0) {
      router.push(Routes.createApp({ orgId }));
    }
  }, [fetchApps, apps, orgId, router]);

  const [searchFilter, setSearchFilter] = useState<string>("");
  const [filteredApps, setFilteredApps] = useState<App[]>([]);
  useEffect(() => {
    if (searchFilter.length > 0) {
      setFilteredApps(
        apps?.filter((app) =>
          app.name.toLowerCase().includes(searchFilter.toLowerCase()),
        ) ?? [],
      );
    } else {
      setFilteredApps(apps ?? []);
    }
  }, [apps, searchFilter]);

  return (
    <Flex direction={"column"} minH={"100vh"}>
      <ConfiguredNavigationBar
        items={[
          { kind: "orgs" },
          { kind: "org", orgId: orgId },
          { kind: "apps", orgId: orgId },
        ]}
      />
      <Container maxW={"6xl"}>
        <VStack p={4} w={"full"} gap={8}>
          <Box w={"full"}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size={"lg"} as={"h1"} color={"white"}>
                Apps
              </Heading>

              <InputGroup w={"auto"} color={"white"}>
                <Input
                  placeholder="Search"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.currentTarget.value)}
                />
                <InputRightElement>
                  {searchFilter.length > 0 ? (
                    <Icon
                      as={FiX}
                      aria-label="Clear search"
                      onClick={() => setSearchFilter("")}
                      color={"gray.200"}
                      cursor={"pointer"}
                    />
                  ) : (
                    <Icon as={FiSearch} color={"gray.200"} />
                  )}
                </InputRightElement>
              </InputGroup>
            </Flex>
            <Grid templateColumns="repeat(4, 1fr)" gap={6}>
              {authenticatedUserRole === OrgRole.ADMIN && (
                <GridItem key={"create"}>
                  <AppCard
                    orgId={orgId}
                    appId={-1}
                    name="Create App"
                    type="create"
                    bg="gray.200"
                    color={"gray.600"}
                  />
                </GridItem>
              )}
              {isLoadingApps && (
                <GridItem key={"loading"}>
                  <Flex h={"full"} align={"center"}>
                    <CircularProgress isIndeterminate size={8} />
                  </Flex>
                </GridItem>
              )}
              {filteredApps.map((app, index) => (
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
            </Grid>
          </Box>
        </VStack>
      </Container>
    </Flex>
  );
};
