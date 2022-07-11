import { extendTheme } from "@chakra-ui/react";

const colors = {
  blue: "#022946"
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

// 3. extend the theme
const theme = extendTheme({
  config,
  colors: {
    primary: colors.blue
  }
});

export default theme;
