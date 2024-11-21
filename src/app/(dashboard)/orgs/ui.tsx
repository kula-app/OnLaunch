"use client";

import { getOrgs } from "@/app/actions/get-orgs";
import { NavigationBar } from "@/components/navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import { Logger } from "@/util/logger";
import {
  Box,
  CircularProgress,
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
import React, { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { OrgCard } from "./components/org-card";

const colors = ["purple.500", "blue.300", "cyan.400", "teal.400", "orange.300"];
const logger = new Logger(__filename);

export const UI: React.FC = () => {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  useEffect(() => {
    async function fetchOrgs() {
      setIsLoading(true);
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
      setIsLoading(false);
    }

    if (!orgs) {
      fetchOrgs();
    }
  });

  const [searchFilter, setSearchFilter] = useState<string>("");

  return (
    <Flex direction={"column"} minH={"100vh"}>
      <NavigationBar
        pages={[
          {
            name: "Organizations",
            href: "/orgs",
          },
        ]}
      />
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size={"lg"} as={"h1"} color={"white"}>
            Organizations
          </Heading>

          <InputGroup w={"auto"} color={"white"}>
            <Input
              placeholder="Search"
              value={searchFilter ?? ""}
              onChange={(e) => setSearchFilter(e.currentTarget.value)}
            />
            <InputRightElement>
              {searchFilter !== "" ? (
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
        <Box mb={4}>
          <Text color={"gray.200"}>
            Organizations allow you to manage multiple app projects and invite
            your team to collaborate.
          </Text>
        </Box>
        <Grid templateColumns="repeat(4, minmax(200px, 1fr))" gap={6}>
          <GridItem key={"create"}>
            <OrgCard
              id={-1}
              name="Create Project"
              type="create"
              bg="gray.200"
              color={"gray.600"}
            />
          </GridItem>
          {isLoading && (
            <GridItem key={"loading"}>
              <Flex h={"full"} align={"center"}>
                <CircularProgress isIndeterminate size={8} />
              </Flex>
            </GridItem>
          )}
          {orgs
            ?.filter((org) => {
              if (searchFilter === "") {
                return true;
              }
              return org.name
                .toLowerCase()
                .includes(searchFilter.toLowerCase());
            })
            .map((org, index) => (
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
    </Flex>
  );
};
