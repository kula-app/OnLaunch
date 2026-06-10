"use client";

import type { OrgAdminToken } from "@/models/org-admin-token";
import { Button, Dialog, Portal } from "@chakra-ui/react";
import React from "react";

export const DeleteOrgAdminAuthorizationTokenDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  token: OrgAdminToken | undefined;
}> = ({ isOpen, onClose, token, onSubmit }) => {
  const cancelTokenDeletionRef = React.useRef(null);
  return (
    <Dialog.Root
      open={isOpen}
      motionPreset="slide-in-bottom"
      initialFocusEl={() => cancelTokenDeletionRef.current}
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
            <Dialog.Header>Delete Token?</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              The token <strong>{token?.label}</strong> will be deleted. This can
              not be undone and any integration using this token will stop working.
            </Dialog.Body>
            <Dialog.Footer>
              <Button ref={cancelTokenDeletionRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorPalette="red" ml={3} onClick={onSubmit}>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
};
