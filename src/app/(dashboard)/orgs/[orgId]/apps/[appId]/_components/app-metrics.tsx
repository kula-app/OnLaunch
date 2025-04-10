import { getRequestHistoryOfApp } from "@/app/actions/get-request-history-of-app";
import RequestChart from "@/components/request-chart";
import { Box, Heading, Select, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function AppMetrics({
  orgId,
  appId,
}: {
  orgId: string;
  appId: string;
}) {
  const [requestHistory, setRequestHistory] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"31days" | "billing" | "365days">("31days");

  useEffect(() => {
    async function fetchData() {
      const data = await getRequestHistoryOfApp({ orgId, appId });
      setRequestHistory(data);
    }
    fetchData();
  }, [orgId, appId, viewMode]);

  const filteredHistoryItems = requestHistory?.items.filter((item: any) => {
    const now = new Date();
    const itemDate = new Date(item.date);
    if (viewMode === "31days") {
      return now.getTime() - itemDate.getTime() <= 31 * 24 * 60 * 60 * 1000;
    } else if (viewMode === "365days") {
      return now.getTime() - itemDate.getTime() <= 365 * 24 * 60 * 60 * 1000;
    }
    // Add logic for "billing" view mode if needed
    return true;
  });

  return (
    <VStack align="start" spacing={4}>
      <Heading size="md">App Metrics</Heading>
      <Select
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value as "31days" | "billing" | "365days")}
      >
        <option value="31days">Last 31 days</option>
        <option value="billing">Billing period</option>
        <option value="365days">Last 365 days</option>
      </Select>
      <Box w="full" h="400px" bg="gray.700" borderRadius="md" p={4}>
        {requestHistory ? (
          <RequestChart requestData={filteredHistoryItems} />
        ) : (
          <Spinner />
        )}
      </Box>
    </VStack>
  );
}
