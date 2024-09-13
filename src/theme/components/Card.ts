import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const Card = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    container: {
      p: "22px",
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(120px)",
      borderRadius: "20px",
      bg: "linear-gradient(127deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 75%)",
      backgroundClip: "border-box",
    },
    header: {
      display: "flex",
      flexDirection: "column",
    },
    body: {
      display: "flex",
      flexDirection: "column",
    },
  }),
});

export const CardComponent = {
  components: {
    Card,
  },
};
