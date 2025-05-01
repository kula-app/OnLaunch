import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import { getColor } from "@chakra-ui/theme-tools";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const brandOnCardStyle = definePartsStyle((props) => {
  const { colorScheme: c, theme } = props;
  return {
    tab: {
      borderRadius: "full",
      fontWeight: "semibold",
      color: "white",
      _selected: {
        color: getColor(theme, `${c}.700`),
        bg: getColor(theme, `${c}.100`),
      },
    },
  };
});

const Tabs = defineMultiStyleConfig({
  variants: { "brand-on-card": brandOnCardStyle },
});

export const TabsComponent = {
  components: {
    Tabs,
  },
};
