import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
} from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import createOrg from "../../api/orgs/createOrg";
import { loadClientConfig } from "../../config/loadClientConfig";
import Routes from "../../routes/routes";
import styles from "../../styles/Home.module.css";

export default function NewOrgPage() {
  const router = useRouter();
  const toast = useToast();
  const stripeConfig = loadClientConfig().stripeConfig;

  const [orgName, setOrgName] = useState("");

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const org = await createOrg(orgName);

      toast({
        title: "Success!",
        description: "New organisation created.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      resetForm();

      if (stripeConfig.isEnabled) {
        navigateToUpgradePage(org.orgId);
      } else {
        navigateToOrgAppsPage(org.orgId);
      }
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

  function navigateToUpgradePage(orgId: number) {
    router.push(Routes.getOrgUpgradeByOrgId(orgId));
  }

  function navigateToOrgAppsPage(orgId: number) {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  }

  function resetForm() {
    (document.getElementById("orgForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <main className={styles.main}>
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
        destination: Routes.LOGIN,
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
