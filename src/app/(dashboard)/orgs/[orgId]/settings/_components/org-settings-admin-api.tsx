"use client";

import { createOrgAdminToken } from "@/app/actions/create-org-admin-token";
import { deleteOrgAdminToken } from "@/app/actions/delete-org-admin-token";
import { loadClientConfig } from "@/config/loadClientConfig";
import { useOrgAdminTokens } from "@/hooks/use-org-admin-tokens";
import { useValueDisclosure } from "@/hooks/use-value-disclosure";
import type { Org } from "@/models/org";
import type { OrgAdminToken } from "@/models/org-admin-token";
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
import { FaCopy, FaEye, FaEyeSlash, FaPlus, FaTrash } from "react-icons/fa6";
import { CreateOrgAdminAuthorizationTokenModal } from "./create-org-admin-authorization-token-modal";
import { DeleteOrgAdminAuthorizationTokenDialog } from "./delete-org-admin-authorization-token-dialog";

export const OrgSettingsAdminAPI: React.FC<{
  orgId: Org["id"];
}> = ({ orgId }) => {
  const toast = useToast();
  const config = loadClientConfig();

  const { tokens, error, isLoading, refresh } = useOrgAdminTokens({ orgId });

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
                <Text w={"20%"} color={"white"}>
                  {token.label}
                </Text>
                <InputGroup w={"full"} variant={"brand-on-card"}>
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
                        isClosable: true,
                        duration: 3000,
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

            toast({
              title: "Success!",
              description: "Organisation admin token has been deleted!",
              status: "success",
              isClosable: true,
              duration: 6000,
            });
          } catch (error) {
            toast({
              title: `Error while deleting org admin token!`,
              description: `${error}`,
              status: "error",
              isClosable: true,
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

            toast({
              title: "Success!",
              description: "Created new organisation admin token",
              status: "success",
              isClosable: true,
              duration: 6000,
            });
          } catch (error) {
            toast({
              title: "Error while sending createCustomerPortalSession request!",
              description: `${error}`,
              status: "error",
              isClosable: true,
              duration: 6000,
            });
          }
        }}
      />
    </>
  );
};
