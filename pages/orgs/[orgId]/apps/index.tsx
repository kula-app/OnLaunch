import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../../../../styles/Home.module.css";
import { useApps } from "../../../../api/apps/useApps";
import { useOrg } from "../../../../api/orgs/useOrg";
import Routes from "../../../../routes/routes";
import {
  Button,
  Table,
  Tooltip,
  Th,
  Thead,
  Tbody,
  Tr,
  Td,
  Stack,
  Skeleton,
} from "@chakra-ui/react";

export default function AppsPage() {
  const router = useRouter();

  const orgId = Number(router.query.orgId);

  function navigateToMessagesPage(appId: number) {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }

  const { apps, isError: error, isLoading } = useApps(orgId);
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
      <main className={styles.main}>
        <h1 className="text-3xl font-bold text-center">
          Organisation &apos;{org?.name}&apos;
        </h1>
        <Button
          className="mt-8"
          colorScheme="blue"
          onClick={() => {
            navigateToOrgSettingsPage(orgId);
          }}
        >
          Organisation Settings
        </Button>
        <h1 className="text-2xl font-bold text-center mt-12">Apps</h1>
        {org?.role === "ADMIN" && (
          <div>
            <Button
              className="mt-8"
              colorScheme="blue"
              onClick={() => {
                navigateToNewAppPage();
              }}
            >
              New App
            </Button>
          </div>
        )}
        <div>
          <Table
            sx={{ minWidth: 650, maxWidth: 1000 }}
            aria-label="simple table"
            className="mt-8"
          >
            <Thead>
              <Th width="5%">
                <strong>ID</strong>
              </Th>
              <Th>
                <strong>App Name</strong>
              </Th>
              <Th width="5%">
                <strong># Active Messages</strong>
              </Th>
            </Thead>
            <Tbody>
              {apps?.map((app, index) => {
                return (
                  <Tr
                    key={index}
                    className="clickable-row h-16"
                    onClick={() => navigateToMessagesPage(app.id)}
                  >
                    <Td width="5%">{app.id}</Td>
                    <Td>{app.name}</Td>
                    <Td width="5%">
                      <Tooltip
                        label={
                          app.activeMessages +
                          " message" +
                          (app.activeMessages !== 1 ? "s are" : " is") +
                          " currently shown in mobile apps"
                        }
                      >
                        <div className="flex justify-center">
                          {app.activeMessages}
                        </div>
                      </Tooltip>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          {isLoading && (
            <div className="w-full">
              <Stack>
                <Skeleton height="60px" />
                <Skeleton height="60px" />
                <Skeleton height="60px" />
              </Stack>
            </div>
          )}
        </div>
        {apps?.length == 0 && <p className="mt-4">no data to show</p>}
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
