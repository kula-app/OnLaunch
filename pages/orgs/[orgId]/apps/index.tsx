import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "../../../../styles/Home.module.css";
import { useApps } from "../../../../api/apps/useApps";
import { useOrg } from "../../../../api/orgs/useOrg";
import Routes from "../../../../routes/routes";
import {
  Button,
  Table,
  Text,
  Tooltip,
  Th,
  Thead,
  Tbody,
  Tr,
  Td,
  Stack,
  Skeleton,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import RequestsChart from "../../../../components/RequestsChart";
import getDashboardData from "../../../../api/dashboard/getDashboardData";

export default function AppsPage() {
  const router = useRouter();
  const toast = useToast();

  const orgId = Number(router.query.orgId);

  const [data, setData] = useState<DashboardRequestData[]>([]);
  const [currentPeriodStart, setCurrentPeriodStart] = useState<Date>();
  const [periodStartDayCount, setPeriodStartDayCount] = useState<number>();

  useEffect(() => {
    // Use the abstracted function
    const fetchData = async () => {
      try {
        const data = await getDashboardData(orgId);
        setData(data.dailyCounts);
        if (data.billingDay?.date) {
          setCurrentPeriodStart(data.billingDay.date);
          setPeriodStartDayCount(data.billingDay.countAfterBillingStart);
        }
      } catch (error) {
        toast({
          title: "Failed to fetch dashboard data!",
          description: "Please try again later",
          status: "error",
          isClosable: true,
          duration: 6000,
        });
      }
    };

    fetchData();
  }, [orgId, toast]);

  // Either show whole last 31 days or filter to only show request data
  // during the current billing period
  const getFilteredData = (): DashboardRequestData[] => {
    if (!currentPeriodStart || periodStartDayCount === undefined) return data; // Return original data if not showing current billing period

    // Filter out dates before currentPeriodStart and add the currentPeriodStart with its count
    return [
      ...data.filter(
        (entry) => new Date(entry.date) > new Date(currentPeriodStart)
      ),
      {
        date: new Date(currentPeriodStart).toISOString().split("T")[0], // Convert date to string in YYYY-MM-DD format
        count: periodStartDayCount,
      },
    ];
  };

  const derivedData = getFilteredData();
  const totalSum = derivedData.reduce(
    (sum, entry) => sum + Number(entry.count),
    0
  );

  const { apps, isError: error, isLoading } = useApps(orgId);
  const { org, isError: orgError } = useOrg(orgId);

  if (error || orgError) return <div>Failed to load</div>;

  function navigateToMessagesPage(appId: number) {
    router.push(Routes.getMessagesByOrgIdAndAppId(orgId, appId));
  }

  function navigateToOrgSettingsPage(id: number) {
    router.push(Routes.orgSettingsById(id));
  }

  function navigateToNewAppPage() {
    router.push(Routes.createNewAppForOrgId(orgId));
  }

  return (
    <>
      <main className={styles.main}>
        <Heading className="text-center">
          Organisation &apos;{org?.name}&apos;
        </Heading>
        <Button
          className="mt-8"
          colorScheme="blue"
          onClick={() => {
            navigateToOrgSettingsPage(orgId);
          }}
        >
          Organisation Settings
        </Button>
        {org?.role === "ADMIN" && data.length > 0 && (
          <>
            <Heading className="text-center my-12">
              App requests in the past days
            </Heading>
            <RequestsChart requestData={derivedData} />
            <Heading size="lg">Total requests: {totalSum}</Heading>
            <Text>in the last 31 days</Text>
          </>
        )}
        <Heading className="text-center mt-12">Apps</Heading>
        {org?.role === "ADMIN" && (
          <div>
            <Button
              className="mt-8"
              colorScheme="blue"
              onClick={navigateToNewAppPage}
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
              <Tr>
                <Th width="5%">
                  <strong>ID</strong>
                </Th>
                <Th>
                  <strong>App Name</strong>
                </Th>
                <Th width="5%">
                  <strong># Active Messages</strong>
                </Th>
              </Tr>
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
