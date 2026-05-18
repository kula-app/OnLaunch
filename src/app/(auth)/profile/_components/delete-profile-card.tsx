"use client";

import { deleteUser } from "@/app/actions/delete-user";
import { ServerError } from "@/errors/server-error";
import {
  Box,
  Button,
  Card,
  Heading,
  Text,
  useDisclosure,
  VStack,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { signOut } from "next-auth/react";
import { useRef } from "react";

export const DeleteProfileCard: React.FC = () => {
  const { open, onOpen: openDeleteDialog, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  async function sendDeleteProfile() {
    try {
      const response = await deleteUser();
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }

      signOut();
    } catch (error) {
      toaster.create({
        title: "Error while sending request!",
        description: `${error}`,
        type: "error",
        closable: true,
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
        <Card.Root p={4} w={"full"}>
          <Card.Body>
            <VStack w={"full"} gap={4} align={"start"}>
              <Text color={"white"} w={"full"}>
                Once you delete your profile, there is no going back. Please be
                certain.
              </Text>
              <Button colorPalette="red" onClick={openDeleteDialog}>
                Delete Profile
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
      <Dialog.Root
        open={isOpen}
        motionPreset="slideInBottom"
        initialFocusEl={() => cancelRef.current}
        placement='center'
        role='alertdialog'
        onOpenChange={e => {
          if (!e.open) {
            onClose();
          }
        }}>
        <Portal>

          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>Are you sure?</Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body>
                Once you delete your profile, there is no going back. Please be
                certain.
              </Dialog.Body>
              <Dialog.Footer>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorPalette="red"
                  ml={3}
                  onClick={() => {
                    sendDeleteProfile();
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
    </>
  );
};
