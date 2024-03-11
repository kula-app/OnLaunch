import { Button, Checkbox, Divider, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import createCheckoutSession from "../api/stripe/createCheckoutSession";
import { Product } from "../models/product";
import { ProductType } from "../models/productType";
import Routes from "../routes/routes";

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
    <div className="flex flex-col p-8 max-w-[350px] h-full mt-10 border-gray-100 shadow-2xl border-4 text-center">
      <div className="h-28 items-center font-bold">
        <Heading className="text-center">{props.product.name}</Heading>
        <Text className="mt-4">{props.product.description}</Text>
      </div>
      <Text className="mt-2">
        includes up to <br />
        <b>{props.product.requests} requests</b>
      </Text>
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
          <Divider
            className="mt-6 mb-4"
            borderColor={borderColor}
            borderWidth={borderWidth}
          />
          <Checkbox
            isChecked={includeUnlimitedOption}
            onChange={(e) => {
              setIncludeUnlimitedOption(e.target.checked);
            }}
          >
            unlimited exceeding requests at{" "}
            {formatCurrency(
              props.product.unlimitedOption.priceAmount as number
            )}{" "}
            per extra request
          </Checkbox>
        </div>
      )}
      <div className="flex-grow"></div>
      <Button
        colorScheme="highlightPurple"
        onClick={() => handleSubscription()}
        className="mt-4 flex w-full"
        role="link"
      >
        choose this abo
      </Button>
    </div>
  );
};

export default ProductCard;
