"use client";

import { getOrgs } from "@/app/actions/get-orgs";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import Routes from "@/routes/routes";
import { Logger } from "@/util/logger";
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
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { OrgCard } from "./_components/org-card";

const logger = new Logger(__filename);

export const UI: React.FC = () => {
  const router = useRouter();
  const toast = useToast();

  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const fetchOrgs = useCallback(async () => {
    setIsLoadingOrgs(true);
    try {
      logger.verbose("Fetching organizations");
      const response = await getOrgs();
      if (response.error) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setOrgs(response.value);
    } catch (error: any) {
      toast({
        title: "Failed to fetch organizations",
        description: error.message,
        status: "error",
      });
    }
    setIsLoadingOrgs(false);
  }, [toast]);

  useEffect(() => {
    if (!orgs) {
      fetchOrgs();
    } else if (orgs.length === 0) {
      router.push(Routes.createOrg);
    }
  }, [fetchOrgs, orgs, router]);

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

  const colors = [
    "purple.500",
    "blue.300",
    "cyan.400",
    "teal.400",
    "orange.300",
  ];
  return (
    <Flex direction={"column"} minH={"100vh"}>
      <ConfiguredNavigationBar items={[{ kind: "orgs" }]} />
      <Container maxW={"6xl"}>
        <Box p={4}>
          <Flex justify="space-between" align="center" mb={6}>
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
                  bg={colors[index % colors.length]}
                  color={"white"}
                />
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Container>
    </Flex>
  );
};
