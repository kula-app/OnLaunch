import { selectAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(selectAnatomy.keys);

const brandOnCardStyle = definePartsStyle({
  field: {
    bg: "rgb(19,21,54)",
    borderRadius: "20px",
    border: "0.0625rem solid rgb(86, 87, 122)",
  },
  icon: {
    color: "white",
  },
});

const Select = defineMultiStyleConfig({
  variants: {
    "brand-on-card": brandOnCardStyle,
  },
});

export const SelectComponent = {
  components: {
    Select,
  },
};
