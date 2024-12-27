"use client";

import type { OrgAdminToken } from "@/models/org-admin-token";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React from "react";

export const DeleteOrgAdminAuthorizationTokenDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  token: OrgAdminToken | undefined;
}> = ({ isOpen, onClose, token, onSubmit }) => {
  const cancelTokenDeletionRef = React.useRef(null);
  return (
    <AlertDialog
      isOpen={isOpen}
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelTokenDeletionRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>Delete Token?</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          The token <strong>{token?.label}</strong> will be deleted. This can
          not be undone and any integration using this token will stop working.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelTokenDeletionRef} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" ml={3} onClick={onSubmit}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
