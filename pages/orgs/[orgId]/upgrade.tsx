import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../../../styles/Home.module.css";

import { Heading, Skeleton, useToast } from "@chakra-ui/react";
import { useProducts } from "../../../api/stripe/useProducts";
import ProductCard from "../../../components/ProductCard";
import { parseBooleanEnvValue } from "../../../config/parser/parseBooleanEnvValue";

export default function EditOrgPage() {
  const router = useRouter();
  const toast = useToast();
  const { products, isError, isLoading } = useProducts();

  const orgId = Number(router.query.orgId);

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

  if (!parseBooleanEnvValue(process.env.NEXT_PUBLIC_STRIPE_ENABLED)) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
