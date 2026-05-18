"use client";;
import { createAppAdminToken } from "@/app/actions/create-app-admin-token";
import { deleteAppAdminToken } from "@/app/actions/delete-app-admin-token";
import { toaster } from "@/components/ui/toaster";
import { loadClientConfig } from "@/config/loadClientConfig";
import { useAppAdminTokens } from "@/hooks/use-app-admin-tokens";
import { useValueDisclosure } from "@/hooks/use-value-disclosure";
import { App } from "@/models/app";
import type { AppAdminToken } from "@/models/app-admin-token";
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
import { Tooltip } from '@/components/ui/tooltip';
import React, { useState } from "react";
import {
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaTrash,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { CreateAppAdminAuthorizationTokenModal } from "./create-app-admin-authorization-token-modal";
import { DeleteAppAdminAuthorizationTokenDialog } from "./delete-app-admin-authorization-token-dialog";
import { LuExternalLink } from 'react-icons/lu';

export const AppSettingsAdminAPI: React.FC<{
  appId: App["id"];
}> = ({ appId }) => {
  const config = loadClientConfig();

  const { tokens, error, isLoading, refresh } = useAppAdminTokens(appId);

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
  } = useValueDisclosure<AppAdminToken>();

  const [visibleTokens, setVisibleTokens] = useState<Set<AppAdminToken["id"]>>(
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
                <Text w={"25%"} color={"white"}>
                  {token.label}
                </Text>
                <Text w={"25%"} color={"gray.400"}>
                  {token.expiryDate ? (
                    <VStack align={"start"}>
                      <Text fontSize={"xs"}>Valid until</Text>
                      <Text>{token.expiryDate.toLocaleString()}</Text>
                    </VStack>
                  ) : (
                    <HStack>
                      <FaTriangleExclamation />
                      <Text lineClamp={1}>No expiration date</Text>
                    </HStack>
                  )}
                </Text>
                <InputGroup
                  w={"full"}
                  maxW={"400px"}
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
      <DeleteAppAdminAuthorizationTokenDialog
        isOpen={isTokenDeletionOpen}
        onClose={onTokenDeletionClose}
        onSubmit={async () => {
          if (!tokenToDelete) {
            return;
          }
          try {
            await deleteAppAdminToken({
              tokenId: tokenToDelete.id,
            });
            refresh();

            toaster.create({
              title: "Success!",
              description: "App admin token has been deleted!",
              type: "success",
            });
          } catch (error) {
            toaster.create({
              title: `Failed to delete app admin token!`,
              description: `${error}`,
              type: "error",
            });
          }
        }}
        token={tokenToDelete}
      />
      <CreateAppAdminAuthorizationTokenModal
        isOpen={isCreateTokenOpen}
        onClose={onCreateTokenClose}
        onSubmit={async (label, expirationDate) => {
          try {
            await createAppAdminToken({ appId, label, expirationDate });
            refresh();

            toaster.create({
              title: "Success!",
              description: "Created new app admin token",
              type: "success",
            });
          } catch (error) {
            toaster.create({
              title: "Failed to create app admin token!",
              description: `${error}`,
              type: "error",
            });
          }
        }}
      />
    </>
  );
};
