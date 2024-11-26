import { tableAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tableAnatomy.keys);

const brandOnCardStyle = definePartsStyle({
  table: {
    color: "white",
  },
  thead: {
    borderBottom: "1px solid",
  },
  th: {
    pb: 4,
  },
});

const Table = defineMultiStyleConfig({
  variants: { "brand-on-card": brandOnCardStyle },
});

export const TableComponent = {
  components: {
    Table,
  },
};
