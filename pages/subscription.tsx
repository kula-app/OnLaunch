import { Heading } from "@chakra-ui/react";
import { getSession } from "next-auth/react";
import styles from "../styles/Home.module.css";

export default function ProfilePage() {
  return (
    <>
      <main className={styles.main}>
        <Heading className="text-center">Success!</Heading>
      </main>
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
