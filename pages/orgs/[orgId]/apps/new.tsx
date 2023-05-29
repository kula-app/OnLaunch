import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import styles from "../../../../styles/Home.module.css";
import { getSession } from "next-auth/react";
import createApp from "../../../../api/apps/createApp";
import Routes from "../../../../routes/routes";
import { Input, Button, IconButton, useToast } from "@chakra-ui/react";

export default function NewAppPage() {
  const router = useRouter();
  const toast = useToast();

  const orgId = Number(router.query.orgId);

  const [appName, setAppName] = useState("");

  function navigateToAppsPage() {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  }

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createApp(orgId, appName);

      toast({
        title: "Success!",
        description: "Apps has been created.",
        status: "success",
        isClosable: true,
        duration: 6000,
      });

      resetForm();
      navigateToAppsPage();
    } catch (error) {
      toast({
        title: "Error while creating new app!",
        description: `${error}`,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }

  function resetForm() {
    (document.getElementById("appForm") as HTMLFormElement)?.reset();
  }

  return (
    <>
      <div>
        <main className={styles.main}>
          <h1>New App</h1>
          <form id="appForm" onSubmit={submitHandler} className="column">
            <label>
              Name
              <Input
                required
                id="name"
                onChange={(event) => setAppName(event.target.value)}
              />
            </label>
            <Button
              type="submit"
              className="marginTopMedium"
            >
              save
            </Button>
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
