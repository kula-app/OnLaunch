"use client";

import { Box, Button, Checkbox, Divider, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import createCheckoutSession from "../api/stripe/createCheckoutSession";
import { Product } from "../models/product";
import { ProductType } from "../models/productType";
import { Routes } from "../routes/routes";

interface Props {
  product: Product;
  orgId: number;
}

function formatCurrency(value: number, currency: string = "EUR") {
  let fractionDigits = 2; // default fraction digits

  // Check if value is less than 0.01 (i.e., 1 cent)
  if (value && value < 0.01) {
    const valueStr = value.toString().split(".")[1] || "";
    fractionDigits = valueStr.length;
  }

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: fractionDigits,
  });
}

const ProductCard = (props: Props) => {
  const router = useRouter();

  const borderColor = "grey";
  const borderWidth = "1px";

  function navigateToOrgDetailsPage(id: number) {
    router.push(Routes.apps({ orgId: id }));
  }

  const [includeUnlimitedOption, setIncludeUnlimitedOption] = useState(false);

  const handleSubscription = async () => {
    if (props.product.id === "FREE") {
      // free subscription for new org does not require an entry in our db
      navigateToOrgDetailsPage(props.orgId);
    } else {
      let products: ProductType[] = [
        { priceId: props.product.priceId as string, quantity: 1 },
      ];

      // add option for unlimited requests to users order
      if (includeUnlimitedOption && props.product.unlimitedOption) {
        products.push({ priceId: props.product.unlimitedOption.priceId });
      }

      const data = await createCheckoutSession(products, props.orgId);
      // forward to stripe url
      window.location.assign(data);
    }
  };

  return (
    <Flex
      direction="column"
      p={8}
      maxW="350px"
      h="full"
      shadow="2xl"
      borderWidth={4}
      textAlign="center"
      color={"white"}
    >
      <Flex direction={"column"} alignItems="center" fontWeight="bold">
        <Text fontSize={"3xl"} textAlign="center" color="white">
          {props.product.name}
        </Text>
        <Text mt={4} color="white">
          {props.product.description}
        </Text>
      </Flex>
      <Text mt={2} color="white">
        includes up to <br />
        <b>{props.product.requests} requests</b>
      </Text>
      <Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          pt={4}
        >
          <Text fontSize="5xl" fontWeight="bold" mt={4}>
            {((props.product.priceAmount as number) / 100).toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: "EUR",
              },
            )}
          </Text>
          <Text>per month</Text>
        </Box>
      </Box>
      {props.product.unlimitedOption && (
        <Box>
          <Divider borderColor={borderColor} borderWidth={borderWidth} />
          <Checkbox
            isChecked={includeUnlimitedOption}
            onChange={(e) => {
              setIncludeUnlimitedOption(e.target.checked);
            }}
          >
            unlimited exceeding requests at{" "}
            {formatCurrency(
              props.product.unlimitedOption.priceAmount as number,
            )}{" "}
            per extra request
          </Checkbox>
        </Box>
      )}
      <Box flexGrow={1}></Box>
      <Button
        colorScheme="blue"
        onClick={() => handleSubscription()}
        mt={4}
        w="full"
        role="link"
      >
        Select Plan
      </Button>
    </Flex>
  );
};

export default ProductCard;
