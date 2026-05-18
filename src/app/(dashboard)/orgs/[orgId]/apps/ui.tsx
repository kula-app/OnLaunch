"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { useApps } from "@/hooks/use-apps";
import { useAuthenticatedUserRole } from "@/hooks/use-authenticated-user-role";
import { OrgRole } from "@/models/org-role";
import { Routes } from "@/routes/routes";
import { rainbowColors } from "@/theme/rainbow-colors";
import {
  Box,
  ProgressCircle,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Input,
  InputGroup,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { AppCard } from "../_components/app-card";

export const UI: React.FC<{ orgId: number }> = ({ orgId }) => {
  const router = useRouter();

  const { role: authenticatedUserRole } = useAuthenticatedUserRole({ orgId });
  const { isLoading: isLoadingApps, apps } = useApps({ orgId });

  useEffect(() => {
    if (apps && apps.length === 0) {
      router.push(Routes.createApp({ orgId }));
    }
  }, [apps, orgId, router]);

  const [searchFilter, setSearchFilter] = useState<string>("");
  const [filteredApps, setFilteredApps] = useState<typeof apps>([]);
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

              <InputGroup
                w={"auto"}
                color={"white"}
                endElement={
                  searchFilter.length > 0 ? (
                    <Icon aria-label="Clear search" color={"gray.200"} cursor={"pointer"} asChild><FiX onClick={() => setSearchFilter("")} /></Icon>
                  ) : (
                    <Icon color={"gray.200"} asChild><FiSearch /></Icon>
                  )
                }
              >
                <Input
                  placeholder="Search"
                  value={searchFilter}
                  onValueChange={(e) => setSearchFilter(e.currentTarget.value)}
                />
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
                    <ProgressCircle.Root value={null} size={8}>
                      <ProgressCircle.Circle>
                        <ProgressCircle.Track />
                        <ProgressCircle.Range />
                      </ProgressCircle.Circle>
                    </ProgressCircle.Root>
                  </Flex>
                </GridItem>
              )}
              {filteredApps?.map((app, index) => (
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
