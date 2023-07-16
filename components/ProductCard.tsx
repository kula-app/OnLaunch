import React from "react";
import { Product } from "../models/product";
import { Button, Heading } from "@chakra-ui/react";

interface Props {
  product: Product;
}

const ProductCard = (props: Props) => {
  return (
    <div className="p-5 max-w-[500px]" style={{ padding: 32 }}>
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
          </div>
        </div>

        <Button colorScheme="blue" type="submit" className="mt-8 flex w-full">
          choose this abo
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
