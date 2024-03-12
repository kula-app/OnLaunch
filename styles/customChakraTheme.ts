import { extendTheme } from "@chakra-ui/react";
import AppColors from "./appColors";

const customTheme = extendTheme({
  colors: {
    backgroundBlack: AppColors.backgroundBlack,
    backgroundGray: AppColors.backgroundGray,
    textWhite: AppColors.textWhite,
    textGray: AppColors.textGray,
    highlightPurple: {
      500: AppColors.highlightPurple[500], // Main shade
      600: AppColors.highlightPurple[600], // Darker shade for hover
      700: AppColors.highlightPurple[700], // Even darker for active
    },
    detailGrayPurple: {
      500: AppColors.detailGrayPurple[500],
      600: AppColors.detailGrayPurple[600],
    },
  },
  components: {
    Input: {
      variants: {
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
      variants: {
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
        color: "gray.500",
        _hover: {
          textDecoration: "underline",
        },
      },
      ".list-item, tbody tr": {
        bg: "backgroundGray",
        _hover: {
          bg: "gray.600",
        },
        color: "white",
      },
      "input, textarea": {
        borderColor: "detailGrayPurple.500",
      },
    },
  },
});

export default customTheme;
