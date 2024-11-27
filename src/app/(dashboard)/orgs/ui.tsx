"use client";

import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { useOrgs } from "@/hooks/use-orgs";
import type { Org } from "@/models/org";
import Routes from "@/routes/routes";
import { rainbowColors } from "@/theme/rainbow-colors";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { OrgCard } from "./_components/org-card";

export const UI: React.FC = () => {
  const router = useRouter();

  const { isLoading: isLoadingOrgs, orgs, error } = useOrgs();
  useEffect(() => {
    if (orgs && orgs.length === 0) {
      router.push(Routes.createOrg);
    }
  }, [orgs, router]);

  const [searchFilter, setSearchFilter] = useState<string>("");
  const [filteredOrgs, setFilteredOrgs] = useState<Org[]>([]);
  useEffect(() => {
    if (searchFilter.length > 0) {
      setFilteredOrgs(
        orgs?.filter((org) =>
          org.name.toLowerCase().includes(searchFilter.toLowerCase()),
        ) ?? [],
      );
    } else {
      setFilteredOrgs(orgs ?? []);
    }
  }, [orgs, searchFilter]);

  return (
    <Flex direction={"column"} minH={"100vh"}>
      <ConfiguredNavigationBar items={[{ kind: "orgs" }]} />
      <Container maxW={"6xl"}>
        <VStack w={"full"} align={"start"}>
          <Flex justify="space-between" align="center" mb={6} w={"full"}>
            <Heading size={"lg"} as={"h1"} color={"white"}>
              Organizations
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
          <Text color={"gray.200"} mb={4}>
            Organizations allow you to manage multiple app projects and invite
            your team to collaborate.
          </Text>
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Failed to fetch organizations!</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <Grid templateColumns="repeat(4, 1fr)" gap={6}>
            <GridItem key={"create"}>
              <OrgCard
                id={-1}
                name="Create Organization"
                type="create"
                bg="gray.200"
                color={"gray.600"}
              />
            </GridItem>
            {isLoadingOrgs && (
              <GridItem key={"loading"}>
                <Flex h={"full"} align={"center"}>
                  <CircularProgress isIndeterminate size={8} />
                </Flex>
              </GridItem>
            )}
            {filteredOrgs.map((org, index) => (
              <GridItem key={org.id}>
                <OrgCard
                  id={org.id}
                  name={org.name}
                  bg={rainbowColors[index % rainbowColors.length]}
                  color={"white"}
                />
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Flex>
  );
};
