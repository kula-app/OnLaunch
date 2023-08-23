import React, { useState } from "react";
import { Product } from "../models/product";
import { ProductType } from "../models/productType";
import { Button, Checkbox, Divider, Heading, Text } from "@chakra-ui/react";
import Routes from "../routes/routes";
import { useRouter } from "next/router";
import createCheckoutSession from "../api/stripe/createCheckoutSession";

interface Props {
  product: Product;
  orgId: number;
}

const ProductCard = (props: Props) => {
  const router = useRouter();

  function navigateToOrgDetailsPage(id: number) {
    router.push(Routes.getOrgAppsByOrgId(id));
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
    <div
      className="p-5 max-w-[500px] mt-10 border-gray-100 shadow-2xl border-4 text-center"
      style={{ padding: 32 }}
    >
      <div>
        <div className="bg-gray-200 h-28 items-center font-bold">
          <Heading className="text-center">{props.product.name}</Heading>
          <Text className="mt-2">{props.product.description}</Text>
          <Text className="mt-2">
            includes up to {props.product.requests} requests
          </Text>
        </div>
        <div>
          <div className="flex flex-col items-center justify-center pt-4">
            <Heading className="text-5xl font-bold mt-4">
              {((props.product.priceAmount as number) / 100).toLocaleString(
                "en-US",
                {
                  style: "currency",
                  currency: "EUR",
                }
              )}
            </Heading>
            <p>per month</p>
          </div>
        </div>

        {props.product.unlimitedOption && (
          <div>
            <Divider className="my-2" />
            <Checkbox
              isChecked={includeUnlimitedOption}
              onChange={(e) => {
                setIncludeUnlimitedOption(e.target.checked);
              }}
            >
              unlimited exceeding requests at{" "}
              {(
                (props.product.unlimitedOption.priceAmount as number) / 100
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "EUR",
              })}{" "}
              per extra {props.product.unlimitedOption.divideBy} requests
            </Checkbox>
            <Divider className="my-2" />
          </div>
        )}

        <Button
          colorScheme="blue"
          onClick={() => handleSubscription()}
          className="mt-8 flex w-full"
          role="link"
        >
          choose this abo
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
