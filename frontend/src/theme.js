import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const colors = {
  white: '#ffffff',
  offWhite: '#f1f1f1',
  black: '#000000',
  blue: '#022946',
  darkGray: '#1a202c',
};

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    primary: colors.blue,
    light: {
      500: colors.white,
    },
    darkGray: colors.darkGray,
    offWhite: colors.offWhite,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode('offWhite', 'darkGray')(props),
      },
    }),
  },
  components: {
    Link: {
      baseStyle: {
        textDecoration: 'underline',
      },
    },
    Button: {
      variants: {
        black: {
          bg: 'blackAlpha.800',
          _disabled: {
            pointerEvents: 'none',
          },
          _hover: {
            bg: 'blackAlpha.900',
          },
          color: 'white',
        },
      },
    },
  },
});

export default theme;
