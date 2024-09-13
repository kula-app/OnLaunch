"use client";

import { getOrgs } from "@/app/actions/get-orgs";
import { NavigationBar } from "@/components/NavigationBar";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import Routes from "@/routes/routes";
import { Logger } from "@/util/logger";
import {
  Box,
  Card,
  CardBody,
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
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";

const colors = ["purple.500", "blue.300", "cyan.400", "teal.400", "orange.300"];

const OrgCard: React.FC<{
  id: number;
  name: string;
  type?: "create";
  bg: string;
  color: string;
}> = ({ id, bg, name, type, color }) => {
  const router = useRouter();

  return (
    <Card
      cursor={"pointer"}
      onClick={() => {
        if (type === "create") {
          router.push(Routes.createNewOrg);
        } else {
          router.push(Routes.org(id));
        }
      }}
    >
      <CardBody
        display={"flex"}
        alignItems={"center"}
        flexDir={"row"}
        p={4}
        _hover={{
          bg: "#8991E6",
          borderRadius: 20,
        }}
        _active={{
          bg: "rgba(10, 14, 35, 0.49)",
          borderRadius: 20,
        }}
      >
        <Box
          bg={bg ?? color}
          color={color ?? "white"}
          fontWeight="bold"
          width={10}
          height={10}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={3}
        >
          {type == "create" ? <Icon as={FiPlus} /> : name.substring(0, 1)}
        </Box>
        <Text fontWeight="medium" color="white" maxH={10}>
          {name}
        </Text>
      </CardBody>
    </Card>
  );
};

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
      <NavigationBar currentPage={"Organizations"} />
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
