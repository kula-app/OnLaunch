import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";

import { getSession } from 'next-auth/react';

export default function DashboardPage() {

  return (
    <>
      <Navbar hasSession={true} />
      <main className={styles.main}>
        <h1>Organisations</h1>
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      }
    }
  }

  return {
    props: { session },
  };
}