"use client";

import { Box } from "@chakra-ui/react";
import { useFormikContext } from "formik";
import type { FilterFormData } from "../../_models/filters/filters-form-data";
import { AdvancedFiltersRuleGroupBox } from "./advanced-filters-rule-group-box";

export const AdvancedFiltersEditor: React.FC = () => {
  const { setFieldValue } = useFormikContext<FilterFormData>();
  return (
    <Box color={"white"} w={"full"} overflowY={"scroll"} maxH={"55vh"}>
      <AdvancedFiltersRuleGroupBox
        keypath={["advanced", "root"]}
        level={0}
        setAdvancedFilterDirty={() => {
          setFieldValue("advanced.isDirty", true);
        }}
      />
    </Box>
  );
};
