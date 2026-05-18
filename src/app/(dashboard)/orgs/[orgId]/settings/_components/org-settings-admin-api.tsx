"use client";;
import { createOrgAdminToken } from "@/app/actions/create-org-admin-token";
import { deleteOrgAdminToken } from "@/app/actions/delete-org-admin-token";
import { loadClientConfig } from "@/config/loadClientConfig";
import { useOrgAdminTokens } from "@/hooks/use-org-admin-tokens";
import { useValueDisclosure } from "@/hooks/use-value-disclosure";
import type { Org } from "@/models/org";
import type { OrgAdminToken } from "@/models/org-admin-token";
import {
  Alert,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Link,
  Skeleton,
  Spacer,
  Text,
  useDisclosure,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { Tooltip } from '@/components/ui/tooltip';
import React, { useState } from "react";
import { FaCopy, FaEye, FaEyeSlash, FaPlus, FaTrash } from "react-icons/fa6";
import { CreateOrgAdminAuthorizationTokenModal } from "./create-org-admin-authorization-token-modal";
import { DeleteOrgAdminAuthorizationTokenDialog } from "./delete-org-admin-authorization-token-dialog";
import { LuExternalLink } from 'react-icons/lu';

export const OrgSettingsAdminAPI: React.FC<{
  orgId: Org["id"];
}> = ({ orgId }) => {
  const config = loadClientConfig();

  const { tokens, error, isLoading, refresh } = useOrgAdminTokens({ orgId });

  const {
    open: isCreateTokenOpen,
    onOpen: onCreateTokenOpen,
    onClose: onCreateTokenClose,
  } = useDisclosure();
  const {
    value: tokenToDelete,
    setValue: setTokenToDelete,
    isOpen: isTokenDeletionOpen,
    onClose: onTokenDeletionClose,
  } = useValueDisclosure<OrgAdminToken>();

  const [visibleTokens, setVisibleTokens] = useState<Set<OrgAdminToken["id"]>>(
    new Set(),
  );

  return (
    <>
      <HStack w={"full"}>
        <VStack align={"start"}>
          <Heading as={"h2"} color={"white"} size={"md"}>
            Authorization Tokens
          </Heading>
          <Text variant={"small"} color={"gray.400"}>
            These tokens are used to authenticate with the{" "}
            <Link
              color={"brand.200"}
              href={`${config.docsConfig.url}#tag/Admin-API`}
              target='_blank'
              rel='noopener noreferrer'>
              Admin API <Icon mx="2px" asChild><LuExternalLink /></Icon>
            </Link>
          </Text>
        </VStack>
        <Spacer />
        <Button colorPalette={"brand"} onClick={onCreateTokenOpen} rounded={"full"}><FaPlus />Create Token
                  </Button>
      </HStack>
      <Box mt={4}>
        {error && (
          <Alert.Root status={"error"}>
            <Alert.Indicator />
            <Alert.Title>Failed to fetch tokens!</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Root>
        )}
        <VStack w={"full"} gap={4}>
          {tokens && tokens.length === 0 && (
            <Alert.Root status={"info"}>
              <Alert.Indicator />
              <Alert.Title>No tokens found!</Alert.Title>
              <Alert.Description>
                You can create a new token by clicking the &quot;Create
                Token&quot; button
              </Alert.Description>
            </Alert.Root>
          )}
          {tokens?.map((token, index) => {
            return (
              <Flex key={index} w={"full"} align={"center"} gap={4}>
                <Text w={"20%"} color={"white"}>
                  {token.label}
                </Text>
                <InputGroup
                  w={"full"}
                  variant={"brand-on-card"}
                  endElement={
                    <IconButton
                      variant={"ghost"}
                      colorPalette={"whiteAlpha"}
                      aria-label={"Toggle visibility"}
                      size={"xs"}
                      onClick={() => {
                        if (visibleTokens.has(token.id)) {
                          setVisibleTokens(
                            visibleTokens.difference(new Set([token.id])),
                          );
                        } else {
                          setVisibleTokens(
                            visibleTokens.union(new Set([token.id])),
                          );
                        }
                      }}>{visibleTokens.has(token.id) ? <FaEyeSlash /> : <FaEye />}</IconButton>
                  }
                >
                  <Input
                    flexGrow={1}
                    value={token.token}
                    readOnly
                    type={visibleTokens.has(token.id) ? "text" : "password"}
                  />
                </InputGroup>
                <Tooltip content="Copy Token">
                  <IconButton
                    colorPalette="gray"
                    aria-label={"Copy Token"}
                    onClick={() => {
                      navigator.clipboard.writeText(token.token);
                      toaster.create({
                        title: "Token copied to clipboard.",
                        type: "info",
                        closable: true,
                        duration: 3000,
                      });
                    }}
                    rounded={"full"}><FaCopy /></IconButton>
                </Tooltip>
                <Tooltip content="Delete Token">
                  <IconButton
                    colorPalette="red"
                    aria-label={"Delete Token"}
                    onClick={() => {
                      setTokenToDelete(token);
                    }}
                    rounded={"full"}><FaTrash /></IconButton>
                </Tooltip>
              </Flex>
            );
          })}
          {isLoading && <Skeleton height={10} />}
        </VStack>
      </Box>
      <DeleteOrgAdminAuthorizationTokenDialog
        isOpen={isTokenDeletionOpen}
        onClose={onTokenDeletionClose}
        onSubmit={async () => {
          if (!tokenToDelete) {
            return;
          }
          try {
            await deleteOrgAdminToken({
              orgId,
              tokenId: tokenToDelete.id,
            });
            refresh();

            toaster.create({
              title: "Success!",
              description: "Organisation admin token has been deleted!",
              type: "success",
              closable: true,
              duration: 6000,
            });
          } catch (error) {
            toaster.create({
              title: `Error while deleting org admin token!`,
              description: `${error}`,
              type: "error",
              closable: true,
              duration: 6000,
            });
          }
        }}
        token={tokenToDelete}
      />
      <CreateOrgAdminAuthorizationTokenModal
        isOpen={isCreateTokenOpen}
        onClose={onCreateTokenClose}
        onSubmit={async (label) => {
          try {
            await createOrgAdminToken({ orgId, label });
            refresh();

            toaster.create({
              title: "Success!",
              description: "Created new organisation admin token",
              type: "success",
              closable: true,
              duration: 6000,
            });
          } catch (error) {
            toaster.create({
              title: "Error while sending createCustomerPortalSession request!",
              description: `${error}`,
              type: "error",
              closable: true,
              duration: 6000,
            });
          }
        }}
      />
    </>
  );
};
