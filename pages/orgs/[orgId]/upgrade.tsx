import { useRouter } from "next/router";
import styles from "../../../styles/Home.module.css";
import { getSession } from "next-auth/react";

import React from "react";
import { Product } from "../../../models/product";
import { useProducts } from "../../../api/stripe/useProducts";
import { Heading, Skeleton, useToast } from "@chakra-ui/react";
import ProductCard from "../../../components/ProductCard";

export default function EditOrgPage() {
  const router = useRouter();
  const toast = useToast();
  const { products, isError, isLoading } = useProducts();

  const orgId = Number(router.query.orgId);
  
  const freeProduct: Product = {
    id: "FREE",
    description: "For checking it out",
    name: "Free",
    nameTag: "free",
    priceId: "",
    priceAmount: 0,
    requests: Number(process.env.NEXT_PUBLIC_FREE_VERSION_LIMIT),
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
        <div>
              <Heading className="text-center">Choose an Abo</Heading>
              <form className="mt-8" id="aboForm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <ProductCard product={freeProduct} orgId={orgId} />
                  {products?.map((product, index) => {
                    return (
                      <ProductCard
                        product={product}
                        orgId={orgId}
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
            </div>
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
