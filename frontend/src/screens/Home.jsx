import { Button, Stack, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { IoAddCircle, IoEnter } from 'react-icons/io5';
import { Link as RouterLink } from 'react-router-dom';

import { LogoHeader } from '../components/Logo';

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
