import React from "react";
import {
  Box,
  Button,
  Container,
  DarkMode,
  Flex,
  IconButton,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {
  MdMenu as MenuIcon,
  MdClose as CloseIcon,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import InternalLink from "./components/InternalLink";

function Logo(props) {
  return (
    <Box {...props}>
      <InternalLink to="/">
        <Text fontSize="xl" fontWeight="bold">
          Threes Scorekeeper
        </Text>
      </InternalLink>
    </Box>
  );
}

const MenuToggle = ({ toggle, isOpen }) => {
  return (
    <Button display={{ base: "block", md: "none" }} onClick={toggle}>
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </Button>
  );
};

const MenuItem = ({ children, isLast = false, to = "/", ...rest }) => {
  return (
    <Button to={to} as={InternalLink}>
      <Text display="block" {...rest}>
        {children}
      </Text>
    </Button>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (
    <Box bg="primary">
      <Container maxWidth="5xl">
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          wrap="wrap"
          mb={8}
          pt={4}
          pb={4}
          color={["white", "white", "primary.700", "primary.700"]}
          {...props}
        >
          <DarkMode>{children}</DarkMode>
        </Flex>
      </Container>
    </Box>
  );
};

const MenuLinks = ({ isOpen, colorMode, toggleColorMode }) => {
  return (
    <Box
      display={{ base: isOpen ? "block" : "none", md: "block" }}
      flexBasis={{ base: "100%", md: "auto" }}
    >
      <Stack
        spacing={2}
        align="center"
        justify={{ sm: "center", md: "space-between", lg: "flex-end" }}
        direction={["column", "column", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        <MenuItem to="/">Home</MenuItem>

        <IconButton
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <MdLightMode /> : <MdDarkMode />}
          aria-label={"Toggle Dark Mode"}
        />
      </Stack>
    </Box>
  );
};

const NavBar = (props) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const [isOpen, setIsOpen] = React.useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <NavBarContainer {...props} sx={{ '& a': { textDecoration: 'initial'}}}>
      <Logo color={["white", "white", "primary.500", "primary.500"]} />
      <MenuToggle toggle={toggle} isOpen={isOpen} />
      <MenuLinks {...{ isOpen, colorMode, toggleColorMode }} />
    </NavBarContainer>
  );
};

export default NavBar;
