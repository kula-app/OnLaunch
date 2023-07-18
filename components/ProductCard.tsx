import React from "react";
import { Product } from "../models/product";
import { Button, Heading, useToast } from "@chakra-ui/react";
import createSubscription from "../api/stripe/createSubscription";
import createOrg from "../api/orgs/createOrg";
import Routes from "../routes/routes";
import { useRouter } from "next/router";

interface Props {
  product: Product;
  orgName: string;
}

const ProductCard = (props: Props) => {
  const router = useRouter();
  const toast = useToast();

  const handleSubscription = async () => {
    if (props.product.id === "FREE") {
      // free subscription for new org
      try {
        await createOrg(props.orgName);

        toast({
          title: "Success!",
          description: "New organisation created.",
          status: "success",
          isClosable: true,
          duration: 6000,
        });

        navigateToDashboardPage();
      } catch (error) {
        toast({
          title: "Error while creating new organisation!",
          description: `${error}`,
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    } else {
      const data = await createSubscription(
        props.product.priceId as string,
        props.orgName
      );
      // forward to stripe url
      window.location.assign(data);
    }
  };

  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  }

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
              {((props.product.price as number) / 100).toLocaleString("en-US", {
                style: "currency",
                currency: "EUR",
              })}
            </Heading>
            <p>per month</p>
          </div>
        </div>

        <Button
          colorScheme="blue"
          isDisabled={props.orgName.trim().length == 0}
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
