import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import { getSession } from "next-auth/react";
import createOrg from "../../api/orgs/createOrg";
import Routes from "../../routes/routes";
import {
  Input,
  useToast,
  Heading,
  FormControl,
  FormLabel,
  Center,
} from "@chakra-ui/react";
import { useProducts } from "../../api/stripe/useProducts";
import ProductCard from "../../components/ProductCard";

export default function NewOrgPage() {
  const router = useRouter();
  const toast = useToast();

  const [orgName, setOrgName] = useState("");
  const { products, isError } = useProducts();

  if (isError) return <div>Failed to load</div>;

  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      // TODO delete this
      await createOrg(orgName);

      toast({
        title: "Success!",
        description: "New organisation created.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      resetForm();
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
  }

  function resetForm() {
    (document.getElementById("orgForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <main className={styles.main}>
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
            </FormControl>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {products?.map((product, index) => {
                return (
                  <div
                    key={index}
                    className="mt-10 border-gray-100 shadow-2xl border-4 text-center"
                  >
                    <ProductCard product={product} orgName={orgName} key={index} />
                  </div>
                );
              })}
            </div>
            <Center></Center>
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
