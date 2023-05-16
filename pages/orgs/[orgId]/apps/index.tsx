import { getSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../../../../styles/Home.module.css";

import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useApps } from "../../../../api/apps/useApps";
import { useOrg } from "../../../../api/orgs/useOrg";
import Routes from "../../../../routes/routes";

export default function AppsPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);

  function navigateToMessagesPage(appId: number) {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }

  const { apps, isError: error, mutate } = useApps(orgId);
  const { org, isError: orgError } = useOrg(orgId);

  if (error || orgError) return <div>Failed to load</div>;

  function navigateToOrgSettingsPage(id: number) {
    router.push(Routes.orgSettingsById(id));
  }

  function navigateToNewAppPage() {
    router.push(Routes.createNewAppForOrgId(orgId));
  }

  return (
    <>
      <Head>
        <title>OnLaunch</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Organisation {org?.name}</h1>
        <Button
          variant="contained"
          onClick={() => {
            navigateToOrgSettingsPage(orgId);
          }}
        >
          Organisation Settings
        </Button>
        <h1>Apps</h1>
        {org?.role === "ADMIN" && (
          <div className="addButton">
            <Button
              variant="contained"
              onClick={() => {
                navigateToNewAppPage();
              }}
            >
              New App
            </Button>
          </div>
        )}
        <Table sx={{ minWidth: 650, maxWidth: 1000 }} aria-label="simple table">
          <TableHead>
            <TableCell width="5%">
              <strong>ID</strong>
            </TableCell>
            <TableCell>
              <strong>App Name</strong>
            </TableCell>
            <TableCell width="5%" className="centeredText">
              <strong># Active Messages</strong>
            </TableCell>
          </TableHead>
          <TableBody>
            {apps?.map((app, index) => {
              return (
                <TableRow
                  key={index}
                  className="clickable-row"
                  onClick={() => navigateToMessagesPage(app.id)}
                >
                  <TableCell width="5%">{app.id}</TableCell>
                  <TableCell>{app.name}</TableCell>
                  <TableCell width="5%" className="centeredText">
                    <Tooltip title="this many messages are currently shown in mobile apps">
                      <div>{app.activeMessages}</div>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {apps?.length == 0 && (
          <p className="marginTopMedium">no data to show</p>
        )}
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
