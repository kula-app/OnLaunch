"use client";

import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";

const RedocStandalone = dynamic(
  () => import("redoc").then((mod) => mod.RedocStandalone),
  { ssr: false },
);

const UI = () => {
  return (
    <Box background="white">
      <RedocStandalone specUrl="/api/openapi.yaml" />;
    </Box>
  );
};

export default UI;
