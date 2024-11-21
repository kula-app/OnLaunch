import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const Menu = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    list: {
      backdropFilter: "blur(120px)",
      bg: "rgba(10, 14, 35, 0.49)",
      border: "1px solid #888888",
    },
    groupTitle: {
      color: "white",
    },
    item: {
      color: "white",
      background: "transparent",
      _hover: {
        background: "#2B327E",
      },
    },
  }),
});

export const MenuComponent = {
  components: {
    Menu,
  },
};
