"use client";

import { useProducts } from "@/api/stripe/useProducts";
import { createCustomerPortalSession } from "@/app/actions/create-customer-portal-session";
import ProductCard from "@/components/product-card";
import { ServerError } from "@/errors/server-error";
import { useOrgSubscriptions } from "@/hooks/use-org-subscriptions";
import type { Org } from "@/models/org";
import { getColorLabel, translateSubName } from "@/util/nameTag";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Grid,
  Heading,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useState } from "react";
import { FiExternalLink } from "react-icons/fi";

export const OrgSettingsBilling: React.FC<{
  orgId: Org["id"];
}> = ({ orgId }) => {
  const router = useRouter();
  const toast = useToast();

  const { subscriptions, isLoading, error } = useOrgSubscriptions({ orgId });
  const { products, isError, isLoading: isLoadingProducts } = useProducts();

  const [isLoadingCustomerPortalSession, setIsLoadingCustomerPortalSession] =
    useState(false);
  const openCustomerPortal = useCallback(async () => {
    setIsLoadingCustomerPortalSession(true);
    try {
      const response = await createCustomerPortalSession({ orgId });
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      router.push(response.value.url);
    } catch (error: any) {
      toast({
        title: "Error while creating session for customer portal",
        description: error.message,
        status: "error",
      });
    }
    setIsLoadingCustomerPortalSession(false);
  }, [orgId, router, toast]);

  return (
    <VStack align={"start"}>
      <Heading as={"h2"} color={"white"} size={"md"}>
        Active Subscription
      </Heading>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Failed to fetch billing data!</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {subscriptions?.length ? (
        <>
          <TableContainer>
            <Table variant={"brand-on-card"}>
              <Thead>
                <Tr>
                  <Th>
                    <strong>Subscription</strong>
                  </Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {subscriptions?.map((sub) => {
                  return (
                    <Tr key={sub.id}>
                      <Td>
                        <Tag
                          size={"md"}
                          borderRadius="full"
                          variant="solid"
                          colorScheme={getColorLabel(sub.name)}
                        >
                          {translateSubName(sub.name)}
                        </Tag>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          <Button
            rightIcon={<FiExternalLink />}
            colorScheme="blue"
            variant="solid"
            onClick={openCustomerPortal}
            isLoading={isLoadingCustomerPortalSession}
          >
            Manage Subscriptions
          </Button>
        </>
      ) : (
        <Text color={"white"}>
          This organization currently has no active subscription
        </Text>
      )}
      <Heading as={"h2"} color={"white"} size={"md"} mt={4}>
        Change Plan
      </Heading>
      {products && (
        <Grid
          templateColumns={`repeat(${products.length}, 1fr)`}
          gap={6}
          mt={8}
        >
          {products.map((product) => (
            <Box flexGrow={1}>
              <ProductCard product={product} orgId={orgId} key={product.id} />
            </Box>
          ))}
        </Grid>
      )}
    </VStack>
  );
};
