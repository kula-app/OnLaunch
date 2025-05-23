"use client";

import { Routes } from "@/routes/routes";
import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import NextLink from "next/link";
import {
  FiBookOpen,
  FiGithub,
  FiHelpCircle,
  FiHome,
  FiLogOut,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { GitHubStargazersButton } from "./ui/github-stargazers-button";

export interface NavigationBarItem {
  name: string;
  href: string;
  isActive?: boolean;
  isLoading?: boolean;
}

export const NavigationBar: React.FC<{
  items?: NavigationBarItem[];
}> = ({ items }) => {
  const session = useSession();

  return (
    <Flex
      direction="row"
      align={"center"}
      justify={"space-between"}
      textStyle={"navigationBar"}
      px={{ base: 4 }}
    >
      <Flex
        direction="row"
        minH={5}
        align={"center"}
        color={"white"}
        justify={"space-between"}
        textStyle={"navigationBar"}
      >
        <Link as={NextLink} href={Routes.index} py={4}>
          <Text fontWeight={"bold"} fontSize={"lg"}>
            OnLaunch
          </Text>
        </Link>
        {items && items.length > 0 && (
          <Breadcrumb
            display={{ base: "none", md: "flex" }}
            px={4}
            alignContent={"center"}
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href={Routes.dashboard}>
                <Icon as={FiHome} />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {items.map((item, index) => (
              <BreadcrumbItem key={index} isCurrentPage={item.isActive}>
                <BreadcrumbLink href={item.href}>
                  {item.isLoading ? (
                    <SkeletonText noOfLines={1} w={20} skeletonHeight={4} />
                  ) : (
                    item.name
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        )}
      </Flex>
      <Flex gap={2}>
        <GitHubStargazersButton />
        <Menu>
          <MenuButton
            as={Button}
            rounded={"full"}
            variant={"link"}
            cursor={"pointer"}
          >
            <Avatar
              bg={"white"}
              color={"black"}
              size={"sm"}
              name={session?.data?.user?.name}
            />
          </MenuButton>
          <MenuList alignItems={"center"} maxW={64}>
            <Box px={3} py={1.5}>
              <HStack color={"white"}>
                <Avatar
                  bg={"brand.400"}
                  color={"white"}
                  size={"sm"}
                  name={session?.data?.user?.name}
                />
                <Text
                  fontWeight={"medium"}
                  noOfLines={1}
                  wordBreak={"break-all"}
                >
                  {session?.data?.user?.name}
                </Text>
              </HStack>
            </Box>
            <MenuDivider />
            <MenuGroup title={"Profile"}>
              <MenuItem
                as={NextLink}
                href={Routes.profile}
                icon={<Icon as={FiUser} boxSize={4} />}
              >
                Your Profile
              </MenuItem>
              <MenuItem
                as={NextLink}
                href={Routes.organizations}
                icon={<Icon as={FiUsers} boxSize={4} />}
              >
                Your Organizations
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title={"Help"}>
              <MenuItem
                as={NextLink}
                href={"https://github.com/kula-app/OnLaunch"}
                target={"_blank"}
                icon={<Icon as={FiGithub} boxSize={4} />}
              >
                GitHub Repo
              </MenuItem>
              <MenuItem
                as={NextLink}
                href={"https://kula-app.github.io/OnLaunch/"}
                target={"_blank"}
                icon={<Icon as={FiBookOpen} boxSize={4} />}
              >
                GitHub Docs
              </MenuItem>
              <MenuItem
                as={NextLink}
                href={"https://kula.app/contact"}
                target={"_blank"}
                icon={<Icon as={FiHelpCircle} boxSize={4} />}
              >
                Support
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuItem
              onClick={() => {
                signOut();
              }}
              icon={<Icon as={FiLogOut} boxSize={4} />}
            >
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};
