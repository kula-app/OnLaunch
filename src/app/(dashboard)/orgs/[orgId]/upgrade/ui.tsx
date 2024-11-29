"use client";

import { useProducts } from "@/api/stripe/useProducts";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import ProductCard from "@/components/product-card";
import { loadClientConfig } from "@/config/loadClientConfig";
import type { Org } from "@/models/org";
import Routes from "@/routes/routes";
import { Container, Flex, Heading, Skeleton, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const UI: React.FC<{
  orgId: Org["id"];
}> = ({ orgId }) => {
  const router = useRouter();
  const toast = useToast();
  const stripeConfig = loadClientConfig().stripeConfig;

  useEffect(() => {
    function navigateToDashboardPage() {
      router.push(Routes.dashboard);
    }

    if (!stripeConfig.isEnabled) {
      navigateToDashboardPage();
    }
  }, [router, stripeConfig.isEnabled]);

  const { products, isError, isLoading } = useProducts();
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error!",
        description:
          "An error occurred while loading the paid subscriptions, please come back later or choose the free subscription.",
        status: "error",
        isClosable: true,
        duration: null,
      });
    }
  }, [isError, toast]);

  return (
    <>
      <Flex direction={"column"} minH={"100vh"}>
        <ConfiguredNavigationBar
          items={[
            { kind: "orgs" },
            { kind: "org", orgId: orgId },
            {
              kind: "upgrade-org",
              orgId: orgId,
            },
          ]}
        />
        <Container maxW={"6xl"}>
          <Heading className="text-center">Choose an Abo</Heading>
          <form className="mt-8" id="aboForm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {products?.map((product, index) => {
                return (
                  <ProductCard product={product} orgId={orgId} key={index} />
                );
              })}
              {isLoading && (
                <div className="w-full mt-10">
                  <Skeleton height="full" />
                </div>
              )}
            </div>
          </form>
        </Container>
      </Flex>
    </>
  );
};
