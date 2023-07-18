import { useState } from "react";
import styles from "../../styles/Home.module.css";
import { getSession } from "next-auth/react";
import {
  Input,
  useToast,
  Heading,
  FormControl,
  FormLabel,
  Skeleton,
} from "@chakra-ui/react";
import { useProducts } from "../../api/stripe/useProducts";
import ProductCard from "../../components/ProductCard";
import { Product } from "../../models/product";

export default function NewOrgPage() {
  const toast = useToast();

  const [orgName, setOrgName] = useState("");
  const { products, isError, isLoading } = useProducts();

  const freeProduct: Product = {
    id: "FREE",
    description: "For checking it out",
    name: "Free",
    priceId: null,
    price: null,
  };

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

  return (
    <>
      <div>
        <main className={styles.main}>
          <Heading className="text-center">New Organisation</Heading>
          <form className="mt-8" id="orgForm">
            <FormControl className="mt-4 flex flex-col items-center">
              <div>
                <FormLabel>Name</FormLabel>
                <Input
                  required
                  id="name"
                  onChange={(event) => setOrgName(event.target.value)}
                />
              </div>
            </FormControl>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <ProductCard product={freeProduct} orgName={orgName} />
              {products?.map((product, index) => {
                return (
                  <ProductCard
                    product={product}
                    orgName={orgName}
                    key={index}
                  />
                );
              })}
              {isLoading && (
                <div className="w-full mt-10">
                  <Skeleton height="full" />
                </div>
              )}
            </div>
          </form>
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
