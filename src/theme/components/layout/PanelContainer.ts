import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const PanelContainer = defineStyleConfig({
  baseStyle: defineStyle({
    p: "30px 15px",
    minHeight: "calc(100vh - 123px)",
  }),
});

export const PanelContainerComponent = {
  components: {
    PanelContainer,
  },
};
