import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const PanelContent = defineStyleConfig({
  baseStyle: defineStyle({
    ms: "auto",
    me: "auto",
    ps: "15px",
    pe: "15px",
  }),
});

export const PanelContentComponent = {
  components: {
    PanelContent,
  },
};
