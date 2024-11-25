import { alertAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    borderRadius: "20px",
  },
});

const alertTheme = defineMultiStyleConfig({ baseStyle });

export const AlertComponent = {
  components: {
    Alert: alertTheme,
  },
};
