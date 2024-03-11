import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  colors: {
    backgroundBlack: "#000000",
    backgroundGray: "#2A292C",
    textWhite: "#FFFFFF",
    textGray: "#8D8D92",
    highlightPurple: {
      500: "#7823C9", // Main shade
      600: "#6a21b3", // Darker shade for hover
      700: "#5d1e9d", // Even darker for active
    },
    detailGrayPurple: "#ADA2C4",
  },
  components: {
    Input: {
      // Style configuration for the Input component
      variants: {
        // You can add this style under each variant you use, e.g., 'outline', 'filled', etc.
        outline: {
          field: {
            _focus: {
              borderColor: "highlightPurple.500",
              boxShadow: `0 0 0 1px var(--chakra-colors-highlightPurple)`,
            },
          },
        },
      },
    },
    Textarea: {
      // Style configuration for the Textarea component
      variants: {
        // Similarly, add this under each variant you use
        outline: {
          _focus: {
            borderColor: "highlightPurple.500",
            boxShadow: `0 0 0 1px var(--chakra-colors-highlightPurple)`,
          },
        },
      },
    },
  },
  styles: {
    global: {
      "html, body": {
        color: "textGray",
        bg: "backgroundBlack",
        lineHeight: "base",
      },
      "h1, h2, h3, h4, h5, h6": {
        color: "textWhite",
      },
      a: {
        color: "highlightPurple.500",
        _hover: {
          textDecoration: "underline",
        },
      },
      ".list-item, tbody tr": {
        bg: "backgroundGray",
        _hover: {
          bg: "gray.600",
        },
      },
      "input, textarea": {
        borderColor: "detailGrayPurple",
      },
    },
  },
});

export default customTheme;
