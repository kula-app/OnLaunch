"use client";

import { useProducts } from "@/api/stripe/useProducts";
import { createCustomerPortalSession } from "@/app/actions/create-customer-portal-session";
import ProductCard from "@/components/product-card";
import { toaster } from "@/components/ui/toaster";
import { ServerError } from "@/errors/server-error";
import { useOrgSubscriptions } from "@/hooks/use-org-subscriptions";
import type { Org } from "@/models/org";
import { getColorLabel, translateSubName } from "@/util/nameTag";
import {
  Alert,
  Box,
  Button,
  Grid,
  Heading,
  Table,
  Tag,
  Text,
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
      toaster.create({
        title: "Error while creating session for customer portal",
        description: error.message,
        type: "error",
      });
    }
    setIsLoadingCustomerPortalSession(false);
  }, [orgId, router]);

  return (
    <VStack align={"start"}>
      <Heading as={"h2"} color={"white"} size={"md"}>
        Active Subscription
      </Heading>
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Failed to fetch billing data!</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Alert.Root>
      )}
      {subscriptions?.length ? (
        <>
          <Table.ScrollArea>
            <Table.Root variant={"brand-on-card"}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>
                    <strong>Subscription</strong>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {subscriptions?.map((sub) => {
                  return (
                    <Table.Row key={sub.id}>
                      <Table.Cell>
                        <Tag.Root
                          size={"md"}
                          borderRadius="full"
                          variant="solid"
                          colorPalette={getColorLabel(sub.name)}
                        >
                          {translateSubName(sub.name)}
                        </Tag.Root>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>

          <Button
            colorPalette="blue"
            variant="solid"
            onClick={openCustomerPortal}
            loading={isLoadingCustomerPortalSession}>Manage Subscriptions
                      <FiExternalLink /></Button>
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
            <Box key={product.id} flexGrow={1}>
              <ProductCard product={product} orgId={orgId} key={product.id} />
            </Box>
          ))}
        </Grid>
      )}
    </VStack>
  );
};
