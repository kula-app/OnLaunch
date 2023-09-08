import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

interface RequestChartProps {
  requestData: DashboardRequestData[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Depicting how many requests have been made from your app clients to your OnLaunch space",
    },
  },
  scales: {
    y: {
      ticks: {
        precision: 0, // Ensure that only whole numbers are shown
      },
    },
  },
};

export default function RequestChart({ requestData }: RequestChartProps) {
  // Sort the requestData based on the date property (ascending)
  const sortedRequestData = [...requestData].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const labels = sortedRequestData.map((item) => {
    const date = new Date(item.date);
    return `${date.getDate()}-${monthNames[date.getMonth()]}`; // Format: DD-MONTH
  });
  const dataSet = sortedRequestData.map((item) => Number(item.count));

  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Requests per day",
        data: dataSet,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <Line
      options={options}
      data={chartData}
      className="max-w-[1000px] max-h-[420px]"
    />
  );
}
