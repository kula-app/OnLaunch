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
  const [showCurrentBillingPeriod, setShowCurrentBillingPeriod] =
    useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await getRequestHistoryOfApp({
        appId: appId,
        orgId: orgId,
      });
      if (response.error) {
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

  // Either show whole last 31 days or filter to only show request data
  // during the current billing period
  const [filteredHistoryItems, setFilteredHistoryItems] = useState<
    RequestHistoryItem[]
  >([]);
  const [totalSum, setTotalSum] = useState(0);
  useEffect(() => {
    let items = history?.items ?? [];
    if (
      showCurrentBillingPeriod &&
      currentPeriodStart &&
      periodStartDayCount !== undefined
    ) {
      // Filter out dates before currentPeriodStart and add the currentPeriodStart with its count
      items = items
        .filter((entry) => new Date(entry.date) > new Date(currentPeriodStart))
        .concat({
          date: new Date(currentPeriodStart).toISOString().split("T")[0], // Convert date to string in YYYY-MM-DD format
          count: periodStartDayCount,
        });
    }
    setFilteredHistoryItems(items);
  }, [
    currentPeriodStart,
    history?.items,
    periodStartDayCount,
    showCurrentBillingPeriod,
  ]);
  useEffect(() => {
    setTotalSum(
      filteredHistoryItems.reduce((previousValue, current) => {
        return Number(BigInt(previousValue) + current.count);
      }, 0),
    );
  }, [filteredHistoryItems]);

  return (
    <Card w={"full"}>
      <CardBody color={"white"}>
        {currentPeriodStart && (
          <Button
            variant="ghost"
            colorScheme="blue"
            className="mt-8"
            onClick={() => {
              setShowCurrentBillingPeriod(!showCurrentBillingPeriod);
            }}
          >
            {showCurrentBillingPeriod
              ? `show last 31 days`
              : `show billing period`}
          </Button>
        )}
        <RequestsChart requestData={filteredHistoryItems} />
        <Text fontSize={"md"}>Total requests: {totalSum}</Text>
        <Text fontSize={"xs"}>
          {showCurrentBillingPeriod
            ? "in the current billing period"
            : "in the last 31 days"}
        </Text>
      </CardBody>
    </Card>
  );
};
