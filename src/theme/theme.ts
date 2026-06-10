import "@fontsource-variable/plus-jakarta-sans";
import {
  createSystem,
  defaultConfig,
  defineRecipe,
  defineSlotRecipe,
} from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      brand: {
        bg: "brand.400",
        color: "#fff",
        fontSize: "16px",
        _hover: { bg: "brand.500" },
        _active: { bg: "brand.600" },
      },
    },
  },
});

const alertRecipe = defineSlotRecipe({
  slots: ["root"],
  base: {
    root: { borderRadius: "20px" },
  },
});

const cardRecipe = defineSlotRecipe({
  slots: ["root", "header", "body"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(120px)",
      borderRadius: 20,
      bg: "linear-gradient(127deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 75%)",
      backgroundClip: "border-box",
    },
    header: { display: "flex", flexDirection: "column" },
    body: { display: "flex", flexDirection: "column" },
  },
});

const menuRecipe = defineSlotRecipe({
  slots: ["content", "itemGroupLabel", "item"],
  base: {
    content: {
      backdropFilter: "blur(120px)",
      bg: "rgba(10, 14, 35, 0.49)",
      border: "1px solid #888888",
    },
    itemGroupLabel: { color: "white" },
    item: {
      color: "white",
      background: "transparent",
      _hover: { background: "#2B327E" },
    },
  },
});

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#f7e7ff" },
          100: { value: "#dbbdf8" },
          200: { value: "#c291ee" },
          300: { value: "#a867e5" },
          400: { value: "#903cdd" },
          500: { value: "#7622c3" },
          600: { value: "#5c1a99" },
          700: { value: "#42126f" },
          800: { value: "#270944" },
          900: { value: "#10021c" },
        },
        gray: {
          700: { value: "#1f2733" },
        },
      },
      fonts: {
        heading: { value: `'Plus Jakarta Sans Variable', sans-serif` },
        body: { value: `'Plus Jakarta Sans Variable', sans-serif` },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "{colors.brand.50}" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
    slotRecipes: {
      alert: alertRecipe,
      card: cardRecipe,
      menu: menuRecipe,
    },
  },
  globalCss: {
    html: {
      fontFamily: `'Plus Jakarta Sans Variable', sans-serif`,
      bg: "rgba(4,9,40,1)",
    },
    body: {
      bg: "linear-gradient(160deg, rgba(59,65,152,1) 15%, rgba(21,29,91,1) 65%, rgba(4,9,40,1) 85%)",
      bgSize: "cover",
      bgPosition: "center center",
      overscrollBehavior: "none",
    },
    "*::placeholder": {
      color: "gray.400",
    },
  },
});
