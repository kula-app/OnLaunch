import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../../styles/Home.module.css";
import { getSession } from "next-auth/react";
import createOrg from "../../api/orgs/createOrg";
import Routes from "../../routes/routes";
import { Input, Button, useToast } from "@chakra-ui/react";

export default function NewOrgPage() {
  const router = useRouter();
  const toast = useToast();

  const [orgName, setOrgName] = useState("");

  function navigateToDashboardPage() {
    router.push(Routes.DASHBOARD);
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
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
          <h1>New Organisation</h1>
          <form id="orgForm" onSubmit={submitHandler}>
            <label>
              Name
              <Input
                required
                id="name"
                onChange={(event) => setOrgName(event.target.value)}
              />
            </label>
            <Button type="submit">save</Button>
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
