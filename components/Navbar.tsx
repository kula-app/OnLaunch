import {
  Avatar,
  Box,
  Button,
  Center,
  Collapse,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { MdClose, MdMenu } from "react-icons/md";
import Routes from "../routes/routes";
import DesktopNav from "./NavbarDesktop";
import MobileNav from "./NavbarMobile";

interface Props {
  session: Session;
}

export default function Header(props: Props) {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();

  function navigateToAuthPage() {
    router.push(Routes.SIGNUP);
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
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <MdClose /> : <MdMenu />}
              variant={"ghost"}
              aria-label={"Toggle Navigation"}
            />
          )}
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Link href={Routes.DASHBOARD}>
            <Text
              textAlign={useBreakpointValue({ base: "center", md: "left" })}
              fontFamily={"heading"}
              color={useColorModeValue("gray.800", "white")}
              as="b"
              textDecoration="none"
            >
              OnLaunch &#128640;
            </Text>
          </Link>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            {!!props.session && <DesktopNav />}
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
        >
          {!props.session && (
            <Button
              as={"a"}
              fontSize={"sm"}
              fontWeight={400}
              variant={"link"}
              onClick={navigateToAuthPage}
              href={"#"}
            >
              Sign In
            </Button>
          )}
          {!!props.session && (
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar size={"sm"} name={props.session.user.name} />
              </MenuButton>
              <MenuList alignItems={"center"}>
                <br />
                <Center>
                  <Avatar size={"2xl"} name={props.session.user.name} />
                </Center>
                <br />
                <Center>
                  <p>{props?.session?.user?.name}</p>
                </Center>
                <br />
                <MenuDivider />
                <MenuItem as="a" href={Routes.DASHBOARD}>
                  Your Organisations
                </MenuItem>
                <MenuItem as="a" href="/profile">
                  Your Profile
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  onClick={() => {
                    signOut();
                    navigateToAuthPage();
                  }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Stack>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}
