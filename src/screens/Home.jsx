import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  useColorModeValue,
  Image,
  Center,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { IoEnter, IoAddCircle } from "react-icons/io5";

import { ReactComponent as CardAceOfHearts } from "../assets/cards/ace_of_hearts.svg";

function CardHero(props) {
  const rotated = (rotate, tx, ty) => {
    const r = `${rotate}deg`;
    const x = `${tx}px`;
    const y = `${ty}px`;
    return {
      margin: 10,
      transform: `rotate(${r}) translate(${x}, ${y})`,
    };
  };
  return (
    <Flex
      paddingTop={{ sm: 0, md: 10 }}
      justifyContent="space-evenly"
      {...props}
    >
      <CardAceOfHearts style={rotated(10, 120, -8)} />
      <CardAceOfHearts style={rotated(12, -6, 7)} />
      <CardAceOfHearts style={rotated(15, -130, 36)} />
    </Flex>
  );
}
function CtaButton(props) {
  const color = useColorModeValue("gray", "gray");
  return (
    <Button
      to="/rooms/new"
      as={RouterLink}
      size="lg"
      padding={8}
      fontSize="xl"
      colorScheme={color}
      {...props}
    >
      {props.children}
    </Button>
  );
}
function HomeBox(props) {
  const color = useColorModeValue("#222", "#CCD2D6");
  return (
    <Box
      //   border="1px solid"
      //   borderColor={color}
      borderRadius={10}
      padding={10}
      textAlign="center"
      {...props}
    >
      {props.children}
    </Box>
  );
}
export default function Home() {
  return (
    <>
      <Flex
        direction={{ sm: "column", md: "row" }}
        justifyContent="space-between"
        alignContent="center"
      >
        <Flex
          direction="column"
          justifyContent="space-evenly"
          alignContent="center"
          alignItems="center"
        >
          <CtaButton to="/tables/join" leftIcon={<IoEnter />} marginBottom={{ sm: 10, md: 0 }}>
            Join Table
          </CtaButton>
          <CtaButton to="/tables/new" leftIcon={<IoAddCircle />}>
            New Table
          </CtaButton>
        </Flex>
        <CardHero />
      </Flex>
    </>
  );
}
