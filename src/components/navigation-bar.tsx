"use client";

import { Routes } from "@/routes/routes";
import {
  Steps,
  Avatar,
  Box,
  Breadcrumb,
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
        <Link py={4} asChild><NextLink href={Routes.index}>
            <Text fontWeight={"bold"} fontSize={"lg"}>
              OnLaunch
            </Text>
          </NextLink></Link>
        {items && items.length > 0 && (
          <Breadcrumb.Root display={{ base: "none", md: "flex" }} px={4} alignContent={"center"}>
            <Breadcrumb.List>{items.map((item, index) => (
                <Breadcrumb.Item key={index}>
                  <Breadcrumb.Link href={item.href}>
                    {item.isLoading ? (
                      <SkeletonText lineClamp={1} w={20} skeletonHeight={4} />
                    ) : (
                      item.name
                    )}
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
              ))}
              <Breadcrumb.Item>
                <Breadcrumb.Link asChild><NextLink href={Routes.dashboard}>
                    <Icon asChild><FiHome /></Icon>
                  </NextLink></Breadcrumb.Link>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        )}
      </Flex>
      <Flex gap={2}>
        <GitHubStargazersButton />
        <Menu>
          <MenuButton
            rounded={"full"}
            variant={"link"}
            cursor={"pointer"}
            asChild
          ><Button>
              <Avatar.Root bg={"white"} color={"black"} size={"sm"}><Avatar.Fallback name={session?.data?.user?.name} /></Avatar.Root>
            </Button></MenuButton>
          <MenuList alignItems={"center"} maxW={64}>
            <Box px={3} py={1.5}>
              <HStack color={"white"}>
                <Avatar.Root bg={"brand.400"} color={"white"} size={"sm"}><Avatar.Fallback name={session?.data?.user?.name} /></Avatar.Root>
                <Text
                  fontWeight={"medium"}
                  lineClamp={1}
                  wordBreak={"break-all"}
                >
                  {session?.data?.user?.name}
                </Text>
              </HStack>
            </Box>
            <MenuDivider />
            <MenuGroup title={"Profile"}>
              <MenuItem icon={<Icon boxSize={4} asChild><FiUser /></Icon>} asChild><NextLink href={Routes.profile}>Your Profile
                              </NextLink></MenuItem>
              <MenuItem icon={<Icon boxSize={4} asChild><FiUsers /></Icon>} asChild><NextLink href={Routes.organizations}>Your Organizations
                              </NextLink></MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title={"Help"}>
              <MenuItem icon={<Icon boxSize={4} asChild><FiGithub /></Icon>} asChild><NextLink href={"https://github.com/kula-app/OnLaunch"} target={"_blank"}>GitHub Repo
                              </NextLink></MenuItem>
              <MenuItem icon={<Icon boxSize={4} asChild><FiBookOpen /></Icon>} asChild><NextLink href={"https://kula-app.github.io/OnLaunch/"} target={"_blank"}>GitHub Docs
                              </NextLink></MenuItem>
              <MenuItem icon={<Icon boxSize={4} asChild><FiHelpCircle /></Icon>} asChild><NextLink href={"https://kula.app/contact"} target={"_blank"}>Support
                              </NextLink></MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuItem
              onClick={() => {
                signOut();
              }}
              icon={<Icon boxSize={4} asChild><FiLogOut /></Icon>}
            >
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};
