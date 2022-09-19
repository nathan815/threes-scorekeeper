import {
  Button,
  Flex,
  Stack,
  Heading,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { IoEnter, IoAddCircle } from 'react-icons/io5';

import config from '../config';

import { ReactComponent as CardAceOfHearts } from '../assets/cards/ace_of_hearts.svg';
import { ReactComponent as JackOfClubs } from '../assets/cards/jack_of_clubs2.svg';
import { ReactComponent as QueenOfClubs } from '../assets/cards/queen_of_clubs2.svg';
import { ReactComponent as KingOfClubs } from '../assets/cards/king_of_clubs2.svg';

function CardHero(props) {
  const brightness = useColorModeValue(1, 0.8);
  const width = useBreakpointValue({ sm: '50%', lg: '30%' });
  const cardStyle = (index, tx, ty, rotate = 8) => {
    const r = `-${rotate}deg`;
    const x = `${tx}%`;
    const y = `${ty}%`;
    return {
      margin: 10,
      zIndex: index,
      transform: `rotate(${r}) translate(${x}, ${y})`,
      filter: `brightness(${brightness})`,
      width: width,
      animate: 'transform 0.5s',
    };
  };
  return (
    <Flex paddingY={{ sm: 0, md: 10 }} justifyContent="space-evenly" {...props}>
      <JackOfClubs style={cardStyle(1, 99, 5)} />
      <QueenOfClubs style={cardStyle(2, 0, 0)} />
      <KingOfClubs style={cardStyle(3, -99, -5)} />
    </Flex>
  );
}

function ActionButton(props) {
  const variant = useColorModeValue('black', undefined);
  return (
    <Button
      to="/rooms/new"
      as={RouterLink}
      padding={8}
      fontSize="xl"
      variant={variant}
      {...props}
    >
      {props.children}
    </Button>
  );
}

export default function Home() {
  return (
    <>
      <Stack
        justifyContent="space-evenly"
        alignContent="center"
        alignItems="center"
        height="100%"
      >
        <Heading>{config.appName}</Heading>
        <CardHero />
        <Stack direction="column" spacing={8}>
          <ActionButton to="/tables/join" leftIcon={<IoEnter />}>
            Join Table
          </ActionButton>
          <ActionButton to="/tables/new" leftIcon={<IoAddCircle />}>
            New Table
          </ActionButton>
        </Stack>
      </Stack>
    </>
  );
}
