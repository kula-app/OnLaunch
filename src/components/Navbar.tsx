import {
  Avatar,
  Box,
  Button,
  Center,
  Collapsible,
  Flex,
  IconButton,
  Link,
  Menu,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
  Portal,
} from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { MdClose, MdMenu } from "react-icons/md";
import { Routes } from "../routes/routes";
import DesktopNav from "./NavbarDesktop";
import MobileNav from "./NavbarMobile";

interface Props {
  session: Session;
}

export default function Header(props: Props) {
  const { open, onToggle } = useDisclosure();
  const router = useRouter();

  function navigateToAuthPage() {
    router.push(Routes.signup);
  }

  return (
    <Box>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          {!!props.session && (
            <IconButton onClick={onToggle} variant={"ghost"} aria-label={"Toggle Navigation"}>{isOpen ? <MdClose /> : <MdMenu />}</IconButton>
          )}
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Link href={Routes.dashboard}>
            <Text
              textAlign={useBreakpointValue({ base: "center", md: "left" })}
              fontFamily={"heading"}
              color={useColorModeValue("gray.800", "white")}
              textDecoration="none"
              asChild
            ><b>OnLaunch 🚀
                          </b></Text>
          </Link>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            {!!props.session && <DesktopNav />}
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          gap={6}
        >
          {!props.session && (
            <Button fontSize={"sm"} fontWeight={400} variant={"link"} asChild><a onClick={navigateToAuthPage} href={"#"}>Sign In
                          </a></Button>
          )}
          {!!props.session && (
            <Menu.Root>
              <Menu.Trigger asChild><Button rounded={"full"} variant={"link"} cursor={"pointer"} minW={0}>
                  <Avatar.Root size={"sm"}><Avatar.Fallback name={props.session.user.name} /></Avatar.Root>
                </Button></Menu.Trigger>
              <Portal><Menu.Positioner><Menu.Content>
                    <br />
                    <Center>
                      <Avatar.Root size={"2xl"}><Avatar.Fallback name={props.session.user.name} /></Avatar.Root>
                    </Center>
                    <br />
                    <Center>
                      <p>{props?.session?.user?.name}</p>
                    </Center>
                    <br />
                    <Menu.Separator />
                    <Menu.Item value='item-0' asChild><a href={Routes.dashboard}>Your Organisations
                                          </a></Menu.Item>
                    <Menu.Item value='item-1' asChild><a href="/profile">Your Profile
                                          </a></Menu.Item>
                    <Menu.Separator />
                    <Menu.Item
                      onSelect={() => {
                        signOut();
                        navigateToAuthPage();
                      }}
                      value='item-2'>
                      Logout
                    </Menu.Item>
                  </Menu.Content></Menu.Positioner></Portal>
            </Menu.Root>
          )}
        </Stack>
      </Flex>
      <Collapsible.Root open={isOpen}>
        <Collapsible.Content>
          <MobileNav />
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}
