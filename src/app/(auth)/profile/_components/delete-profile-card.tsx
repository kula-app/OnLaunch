"use client";

import { deleteUser } from "@/app/actions/delete-user";
import { ServerError } from "@/errors/server-error";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { useRef } from "react";

export const DeleteProfileCard: React.FC = () => {
  const toast = useToast();

  const { isOpen, onOpen: openDeleteDialog, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  async function sendDeleteProfile() {
    try {
      const response = await deleteUser();
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }

      signOut();
    } catch (error) {
      toast({
        title: "Error while sending request!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  return (
    <>
      <Box w={"full"}>
        <Heading size={"md"} as={"h2"} color={"white"} mb={4}>
          Delete Profile
        </Heading>
        <Card p={4} w={"full"}>
          <CardBody>
            <VStack w={"full"} gap={4} align={"start"}>
              <Text color={"white"} w={"full"}>
                Once you delete your profile, there is no going back. Please be
                certain.
              </Text>
              <Button colorScheme="red" onClick={openDeleteDialog}>
                Delete Profile
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Are you sure?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Once you delete your profile, there is no going back. Please be
            certain.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                sendDeleteProfile();
                onClose();
              }}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
