"use client";

import { VStack } from "@chakra-ui/react";
import React from "react";
import { SimpleFiltersAppVersionFilter } from "./simple-filters-app-version-filter";
import { SimpleLanguageFilter } from "./simple-filters-language-filter";
import { SimpleFiltersPlatformFilter } from "./simple-filters-platform-filter";
import { SimpleFiltersPlatformVersionFilter } from "./simple-filters-platform-version-filter";
import { SimpleFiltersRegionFilter } from "./simple-filters-region-filter";

export const SimpleFiltersEditor: React.FC = () => {
  return (
    <VStack w={"full"} align={"start"} gap={6} overflowY={"scroll"}>
      <SimpleFiltersPlatformFilter />
      <SimpleFiltersPlatformVersionFilter />
      <SimpleFiltersAppVersionFilter />
      <SimpleFiltersRegionFilter />
      <SimpleLanguageFilter />
    </VStack>
  );
};
