"use client";

import { createAppAdminToken } from "@/app/actions/create-app-admin-token";
import { deleteAppAdminToken } from "@/app/actions/delete-app-admin-token";
import { loadClientConfig } from "@/config/loadClientConfig";
import { useAppAdminTokens } from "@/hooks/use-app-admin-tokens";
import { useValueDisclosure } from "@/hooks/use-value-disclosure";
import { App } from "@/models/app";
import type { AppAdminToken } from "@/models/app-admin-token";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Skeleton,
  Spacer,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
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

export const AppSettingsAdminAPI: React.FC<{
  appId: App["id"];
}> = ({ appId }) => {
  const toast = useToast();
  const config = loadClientConfig();

  const { tokens, error, isLoading, refresh } = useAppAdminTokens(appId);

  const {
    isOpen: isCreateTokenOpen,
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
              isExternal
            >
              Admin API <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
        </VStack>
        <Spacer />
        <Button
          variant={"brand"}
          onClick={onCreateTokenOpen}
          leftIcon={<FaPlus />}
          rounded={"full"}
        >
          Create Token
        </Button>
      </HStack>
      <Box mt={4}>
        {error && (
          <Alert status={"error"}>
            <AlertIcon />
            <AlertTitle>Failed to fetch tokens!</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        <VStack w={"full"} spacing={4}>
          {tokens && tokens.length === 0 && (
            <Alert status={"info"}>
              <AlertIcon />
              <AlertTitle>No tokens found!</AlertTitle>
              <AlertDescription>
                You can create a new token by clicking the &quot;Create
                Token&quot; button
              </AlertDescription>
            </Alert>
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
                      <Text noOfLines={1}>No expiration date</Text>
                    </HStack>
                  )}
                </Text>
                <InputGroup w={"full"} maxW={"400px"} variant={"brand-on-card"}>
                  <Input
                    flexGrow={1}
                    value={token.token}
                    readOnly
                    type={visibleTokens.has(token.id) ? "text" : "password"}
                  />
                  <InputRightElement>
                    <IconButton
                      variant={"ghost"}
                      colorScheme={"whiteAlpha"}
                      icon={
                        visibleTokens.has(token.id) ? <FaEyeSlash /> : <FaEye />
                      }
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
                      }}
                    />
                  </InputRightElement>
                </InputGroup>
                <Tooltip label="Copy Token">
                  <IconButton
                    colorScheme="gray"
                    aria-label={"Copy Token"}
                    icon={<FaCopy />}
                    onClick={() => {
                      navigator.clipboard.writeText(token.token);
                      toast({
                        title: "Token copied to clipboard.",
                        status: "info",
                      });
                    }}
                    rounded={"full"}
                  />
                </Tooltip>
                <Tooltip label="Delete Token">
                  <IconButton
                    colorScheme="red"
                    aria-label={"Delete Token"}
                    onClick={() => {
                      setTokenToDelete(token);
                    }}
                    icon={<FaTrash />}
                    rounded={"full"}
                  />
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

            toast({
              title: "Success!",
              description: "App admin token has been deleted!",
              status: "success",
            });
          } catch (error) {
            toast({
              title: `Failed to delete app admin token!`,
              description: `${error}`,
              status: "error",
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

            toast({
              title: "Success!",
              description: "Created new app admin token",
              status: "success",
            });
          } catch (error) {
            toast({
              title: "Failed to create app admin token!",
              description: `${error}`,
              status: "error",
            });
          }
        }}
      />
    </>
  );
};
