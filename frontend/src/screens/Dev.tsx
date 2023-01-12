import {
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { openAuthPopupWindow } from 'src/auth/authPopup';
import { useAuthContext } from '../auth/authContext';
import { PlayingCard } from '../components/PlayingCard';
import { ALL_RANKS, ALL_SUITS } from '../utils/card';

export function DevScreen() {
  const authCtx = useAuthContext();

  const login = async () => {
    const res = await openAuthPopupWindow('google');
    console.log('login res', res);
  }

  return (
    <VStack alignItems="left" padding={10}>
      <Card mb={10}>
        <CardBody>
          <VStack justifyContent="start" alignItems="start">
            <Heading size="md">Auth Info</Heading>
            <pre>{JSON.stringify(authCtx, null, 2)}</pre>
            <Button
              title="Copy to clipboard"
              onClick={() =>
                authCtx?.user && navigator.clipboard.writeText(authCtx.user.id)
              }
            >
              Copy ID: {authCtx?.user?.id}
            </Button>
            <Button onClick={login}>Test Login with Google</Button>
          </VStack>
        </CardBody>
      </Card>
      <Heading size="lg">All Playing Cards</Heading>
      <Flex flexWrap="wrap" gap={5} mt={20}>
        {ALL_RANKS.map((rank) =>
          ALL_SUITS.map((suit, idx) => (
            <PlayingCard
              key={idx}
              suit={suit}
              rank={rank}
              width="22%"
              minWidth="200px"
            />
          ))
        )}
      </Flex>
    </VStack>
  );
}
