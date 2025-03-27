"use client";

import { getRequestHistoryOfApp } from "@/app/actions/get-request-history-of-app";
import RequestsChart from "@/components/request-chart";
import { ServerError } from "@/errors/server-error";
import type { App } from "@/models/app";
import type { Org } from "@/models/org";
import type { RequestHistory } from "@/models/request-history";
import { RequestHistoryItem } from "@/models/request-history-item";
import { Button, Card, CardBody, Text, useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export const AppMetrics: React.FC<{ orgId: Org["id"]; appId: App["id"] }> = ({
  orgId,
  appId,
}) => {
  const toast = useToast();

  const [history, setHistory] = useState<RequestHistory | null>();
  const [currentPeriodStart, setCurrentPeriodStart] = useState<Date>();
  const [periodStartDayCount, setPeriodStartDayCount] = useState<number>();

  const [viewMode, setViewMode] = useState<"31days" | "billing" | "365days">("31days");

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getRequestHistoryOfApp({ orgId, appId, timeRange: viewMode });
      if (!response.success) {
        throw new ServerError(response.error.name, response.error.message);
      }
      setHistory(response.value);
    } catch (error: any) {
      toast({
        title: "Failed to fetch dashboard data!",
        description: error.message,
        status: "error",
        isClosable: true,
        duration: 6000,
      });
    }
  }, [orgId, toast, appId]);

  useEffect(() => {
    if (!history) {
      fetchHistory();
    }
  }, [history, fetchHistory]);

  const [filteredHistoryItems, setFilteredHistoryItems] = useState<RequestHistoryItem[]>([]);
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    let items = history?.items ?? [];

    if (viewMode === "billing" && currentPeriodStart && periodStartDayCount !== undefined) {
      items = items
        .filter((entry) => new Date(entry.date) > new Date(currentPeriodStart))
        .concat([
          {
            date: new Date(currentPeriodStart),
            count: BigInt(periodStartDayCount),
          },
        ]);
    } else if (viewMode === "365days") {
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      items = items.filter((entry) => new Date(entry.date) > oneYearAgo);
    }

    setFilteredHistoryItems(items);
  }, [viewMode, currentPeriodStart, history?.items, periodStartDayCount]);

  useEffect(() => {
    setTotalSum(
      filteredHistoryItems.reduce((prev, curr) => {
        return Number(BigInt(prev) + curr.count);
      }, 0)
    );
  }, [filteredHistoryItems]);

  return (
    <Card w={"full"}>
      <CardBody color={"white"}>
        <div className="flex gap-2 mt-4 mb-4">
          <Button
            variant="ghost"
            colorScheme="blue"
            onClick={() => setViewMode("31days")}
          >
            Last 31 days
          </Button>
          <Button
            variant="ghost"
            colorScheme="blue"
            onClick={() => setViewMode("billing")}
            isDisabled={!currentPeriodStart}
          >
            Billing period
          </Button>
          <Button
            variant="ghost"
            colorScheme="blue"
            onClick={() => setViewMode("365days")}
          >
            Last 365 days
          </Button>
        </div>

        <RequestsChart requestData={filteredHistoryItems} />
        <Text fontSize={"md"}>Total requests: {totalSum}</Text>
        <Text fontSize={"xs"}>
          {viewMode === "billing"
            ? "in the current billing period"
            : viewMode === "365days"
            ? "in the last 365 days"
            : "in the last 31 days"}
        </Text>
      </CardBody>
    </Card>
  );
};