import { FormEvent, useState } from "react";
import styles from "../../styles/Home.module.css";
import { getSession } from "next-auth/react";
import {
  Input,
  useToast,
  Heading,
  FormControl,
  FormLabel,
  Skeleton,
  Button,
} from "@chakra-ui/react";
import { useProducts } from "../../api/stripe/useProducts";
import ProductCard from "../../components/ProductCard";
import { Product } from "../../models/product";
import createOrg from "../../api/orgs/createOrg";

export default function NewOrgPage() {
  const toast = useToast();

  const [orgName, setOrgName] = useState("");
  const [orgId, setOrgId] = useState<number>(-1)
  const { products, isError, isLoading } = useProducts();

  const [nextStep, setNextStep] = useState(false);

  const freeProduct: Product = {
    id: "FREE",
    description: "For checking it out",
    name: "Free",
    priceId: "",
    priceAmount: 0,
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

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const org = await createOrg(orgName);

      setOrgId(org.orgId);
      
      toast({
        title: "Success!",
        description: 'New organisation created.',
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      resetForm();

      setNextStep(true);
    } catch (error) {
      toast({
        title: "Error while creating new organisation!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function resetForm() {
    (document.getElementById("orgForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          {!nextStep && (
            <div>
              <Heading className="text-center">New Organisation</Heading>
              <form className="mt-8" id="orgForm" onSubmit={submitHandler}>
                <FormControl className="mt-4 flex flex-col items-center">
                  <div>
                    <FormLabel>Name</FormLabel>
                    <Input
                      required
                      id="name"
                      onChange={(event) => setOrgName(event.target.value)}
                    />
                  </div>
                  <Button colorScheme="blue" className="mt-4" type="submit">
                    next
                  </Button>
                </FormControl>
              </form>
            </div>
          )}
          {nextStep && (
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
          )}
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
