import { extendTheme } from '@chakra-ui/react';
import { colors } from './colors';
import { components } from './components';
import { styles } from './styles';

export const theme = extendTheme(colors, components, styles);
