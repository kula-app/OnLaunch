import React from "react";
import { Product } from "../models/product";
import { Button, Heading } from "@chakra-ui/react";
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

  const handleSubscription = async () => {
    if (props.product.id === "FREE") {
      // free subscription for new org does not require an entry in our db
      navigateToOrgDetailsPage(props.orgId);
    } else {
      const data = await createCheckoutSession(
        props.product.priceId as string,
        props.orgId
      );
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
          <p className="mt-2">{props.product.description}</p>
        </div>
        <div>
          <div className="flex flex-col items-center justify-center pt-4">
            <Heading className="text-5xl font-bold mt-4">
              {((props.product.priceAmount as number) / 100).toLocaleString("en-US", {
                style: "currency",
                currency: "EUR",
              })}
            </Heading>
            <p>per month</p>
          </div>
        </div>

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
