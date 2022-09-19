import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const colors = {
  white: '#ffffff',
  offWhite: '#F3F3F3',
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
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode(colors.offWhite, colors.darkGray)(props),
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
