"use client";

import { Routes } from "@/routes/routes";
import {
  Avatar,
  Box,
  Breadcrumb,
  Button,
  Flex,
  HStack,
  Icon,
  Link,
  Menu,
  Portal,
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
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button rounded={"full"} variant={"plain"} cursor={"pointer"}>
              <Avatar.Root bg={"white"} color={"black"} size={"sm"}>
                <Avatar.Fallback name={session?.data?.user?.name} />
              </Avatar.Root>
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content alignItems={"center"} maxW={64}>
                <Box px={3} py={1.5}>
                  <HStack color={"white"}>
                    <Avatar.Root bg={"brand.400"} color={"white"} size={"sm"}>
                      <Avatar.Fallback name={session?.data?.user?.name} />
                    </Avatar.Root>
                    <Text
                      fontWeight={"medium"}
                      lineClamp={1}
                      wordBreak={"break-all"}
                    >
                      {session?.data?.user?.name}
                    </Text>
                  </HStack>
                </Box>
                <Menu.Separator />
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel>Profile</Menu.ItemGroupLabel>
                  <Menu.Item value="profile" asChild>
                    <NextLink href={Routes.profile}>
                      <Icon boxSize={4} asChild>
                        <FiUser />
                      </Icon>
                      Your Profile
                    </NextLink>
                  </Menu.Item>
                  <Menu.Item value="organizations" asChild>
                    <NextLink href={Routes.organizations}>
                      <Icon boxSize={4} asChild>
                        <FiUsers />
                      </Icon>
                      Your Organizations
                    </NextLink>
                  </Menu.Item>
                </Menu.ItemGroup>
                <Menu.Separator />
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel>Help</Menu.ItemGroupLabel>
                  <Menu.Item value="github-repo" asChild>
                    <NextLink
                      href={"https://github.com/kula-app/OnLaunch"}
                      target={"_blank"}
                    >
                      <Icon boxSize={4} asChild>
                        <FiGithub />
                      </Icon>
                      GitHub Repo
                    </NextLink>
                  </Menu.Item>
                  <Menu.Item value="github-docs" asChild>
                    <NextLink
                      href={"https://kula-app.github.io/OnLaunch/"}
                      target={"_blank"}
                    >
                      <Icon boxSize={4} asChild>
                        <FiBookOpen />
                      </Icon>
                      GitHub Docs
                    </NextLink>
                  </Menu.Item>
                  <Menu.Item value="support" asChild>
                    <NextLink href={"https://kula.app/contact"} target={"_blank"}>
                      <Icon boxSize={4} asChild>
                        <FiHelpCircle />
                      </Icon>
                      Support
                    </NextLink>
                  </Menu.Item>
                </Menu.ItemGroup>
                <Menu.Separator />
                <Menu.Item
                  value="signout"
                  onClick={() => {
                    signOut();
                  }}
                >
                  <Icon boxSize={4} asChild>
                    <FiLogOut />
                  </Icon>
                  Sign out
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Flex>
  );
};
