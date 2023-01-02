import {
  Button,
  Flex,
  Stack,
  Heading,
  useColorModeValue,
  useBreakpointValue,
  Input,
  InputGroup,
  InputRightAddon,
  Box,
  Image,
} from '@chakra-ui/react';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { IoEnter, IoAddCircle } from 'react-icons/io5';

import { ReactComponent as CardAceOfHearts } from '../assets/cards/ace_of_hearts.svg';
import { ReactComponent as JackOfClubs } from '../assets/cards/jack_of_clubs2.svg';
import { ReactComponent as QueenOfClubs } from '../assets/cards/queen_of_clubs2.svg';
import { ReactComponent as KingOfClubs } from '../assets/cards/king_of_clubs2.svg';
import { LogoHeader } from '../components/LogoHeader';

function CardHero(props) {
  const brightness = useColorModeValue(1, 0.8);
  const width = useBreakpointValue({ sm: '30%', lg: '25%' });
  const cardStyle = (index, tx, ty, rotate = 8) => {
    const r = `-${rotate}deg`;
    const x = `${tx}%`;
    const y = `${ty}%`;
    return {
      margin: 10,
      zIndex: index,
      // transform: `rotate(${r}) translate(${x}, ${y})`,
      filter: `brightness(${brightness})`,
      width: width,
      animate: 'transform 0.5s',
    };
  };
  return (
    <Flex paddingY={{ sm: 0, md: 10 }} justifyContent="center" {...props}>
      <JackOfClubs style={cardStyle(1, 99, 5)} />
      <QueenOfClubs style={cardStyle(2, 0, 0)} />
      <KingOfClubs style={cardStyle(3, -99, -5)} />
    </Flex>
  );
}

function ActionButton(props) {
  return (
    <Button
      to="/rooms/new"
      as={RouterLink}
      padding={8}
      fontSize="xl"
      variant={useColorModeValue('black', undefined)}
      {...props}
    >
      {props.children}
    </Button>
  );
}

export function HomeButtons() {
  return (
    <Stack direction="column" spacing={8}>
      <ActionButton to="/join" leftIcon={<IoEnter />}>
        Join Game
      </ActionButton>
      <ActionButton to="/new" leftIcon={<IoAddCircle />}>
        New Game
      </ActionButton>
    </Stack>
  );
}
export default function Home() {
  return (
    <>
      <Stack
        justifyContent="start"
        alignContent="center"
        alignItems="center"
        minHeight="100%"
      >
        <LogoHeader mb={20} />
        <HomeButtons />
        {/* <CardHero /> */}
      </Stack>
    </>
  );
}
