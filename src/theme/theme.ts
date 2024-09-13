import { extendTheme } from "@chakra-ui/react";
import { colors } from "./colors";
import { components } from "./components";
import { fonts } from "./fonts";
import { styles } from "./styles";

export const theme = extendTheme(colors, components, fonts, styles);
