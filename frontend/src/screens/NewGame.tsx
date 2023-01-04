import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { IoArrowForward } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import generateName from 'project-name-generator';

import { useAuthContext } from '../auth/authContext';
import { AuthFlowForm } from '../components/AuthFlowForm';
import { LogoHeader } from '../components/Logo';
import { api, ApiError, ValidationError } from '../api';

function generateGameName() {
  return generateName({ words: 2 })
    .raw.map((w) => w.toString())
    .map((w) => w.charAt(0).toUpperCase() + w.substring(1))
    .join(' ');
}

export function NewGame() {
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.100');
  const authCtx = useAuthContext();
  const navigate = useNavigate();
  const toast = useToast();

  const [gameName, setGameName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ msg: string | null, retryable: boolean}>({ msg: null, retryable: true });

  const createGame = useCallback(
    async (name) => {
      setError({ msg: null, retryable: true });
      setLoading(true);
      try {
        const game = await api.createGame(name);
        toast({
          description: 'Game created',
          status: 'success',
          position: 'bottom-right',
        });
        navigate(`/games/${game.shortId}`);
      } catch (err) {
        console.error(err, err.message);
        let msg = 'An error occurred. Please try again in a moment.';
        if (err instanceof ApiError) {
          if (err instanceof ValidationError) {
            msg = err.humanReadableErrors.join(', ');
          } else if (err.message) {
            msg = `${err.message}`;
          }
        }
        setError({ msg, retryable: true });
      } finally {
        setLoading(false);
      }
    },
    [navigate, toast]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!authCtx?.user || loading) {
        return;
      }
      await createGame(gameName);
    },
    [authCtx?.user, loading, gameName, createGame]
  );

  const handleGameNameInput = (event) => {
    setError({ msg: null, retryable: true });
    setGameName(event.target.value);
  };

  const handleClickGenerateName = (e) => {
    e.preventDefault();
    setGameName(generateGameName);
  };

  return (
    <Stack
      justifyContent="start"
      alignContent="center"
      alignItems="center"
      minHeight="100%"
      paddingBottom={10}
    >
      <LogoHeader width={200} />

      <Box bg={bg} padding={10} borderRadius={10} width={430} maxWidth="100%">
        <Heading size="lg">New Game</Heading>
        <br />

        {!authCtx?.loggedIn && <AuthFlowForm />}

        {authCtx?.loggedIn && (
          <form onSubmit={handleSubmit}>
            <Stack spacing={8}>
              <FormControl isRequired isInvalid={Boolean(error.msg)}>
                <FormLabel>Name for this game</FormLabel>
                <Input
                  id="game-name"
                  placeholder="Game Name"
                  minLength={5}
                  size="lg"
                  autoComplete="off"
                  autoCorrect="off"
                  value={gameName}
                  onChange={handleGameNameInput}
                />
                {error.msg && <FormErrorMessage>{error.msg}</FormErrorMessage>}
                <FormHelperText>
                  Can't think of anything?{' '}
                  <Link href="#" onClick={handleClickGenerateName}>
                    Generate a name
                  </Link>
                </FormHelperText>
              </FormControl>
              <Button
                colorScheme="blue"
                isLoading={loading}
                type="submit"
                size="lg"
                rightIcon={<IoArrowForward />}
              >
                Create
              </Button>
            </Stack>
          </form>
        )}
      </Box>
    </Stack>
  );
}
