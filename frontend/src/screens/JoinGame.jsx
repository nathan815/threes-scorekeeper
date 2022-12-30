import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { IoCamera } from 'react-icons/io5';
import { Navigate, useParams } from 'react-router-dom';
import * as api from '../api';
import { useAuthContext } from '../auth/authContext';
import { AuthFlowForm } from '../components/AuthFlowForm';
import { JoinGameQrCodeScannerModal } from '../components/JoinGameQrCodeScannerModal';
import { LogoHeader } from '../components/LogoHeader';

export function JoinGame() {
  const { gameId: gameIdParam } = useParams();
  const authCtx = useAuthContext();
  const [joinCode, setJoinCode] = useState(gameIdParam);
  const [joined, setJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState({ msg: null, retryable: true });
  const qrModalState = useDisclosure();
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.300');

  async function joinGame(code) {
    setError({ msg: null, retryable: true });
    setJoinLoading(true);
    try {
      await api.joinGame(code);
      setJoined(true);
    } catch (err) {
      console.error(err, err.message);
      let msg = 'An error occurred. Please try again in a moment.';
      let retryable = true;
      if (err instanceof api.ApiError) {
        if (err.context && err.context.errorType === 'IllegalGameStageError') {
          retryable = false;
          msg = `This game has already started so you won't be able to join it.`;
          // setJoinCode('');
        } else if (err.message) {
          msg = `${err.message}`;
        }
      }
      setError({ msg, retryable });
    } finally {
      setJoinLoading(false);
    }
  }

  useEffect(() => {
    if (gameIdParam) {
      joinGame(gameIdParam);
    }
  }, [gameIdParam]);

  const handleJoinSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (joinLoading) {
        return;
      }
      if (!authCtx.user) {
        return;
      }
      await joinGame(joinCode);
    },
    [authCtx.user, joinCode, joinLoading]
  );

  function handleJoinCodeInput(event) {
    setError({ msg: null, retryable: true });
    setJoinCode(event.target.value.toUpperCase().replace(' ', ''));
  }

  function onScanJoinCode(code) {
    setJoinCode(code);
    joinGame(code);
  }

  if (joined) {
    return <Navigate to={`/games/${joinCode}`} />;
  }

  return (
    <>
      <JoinGameQrCodeScannerModal
        isOpen={qrModalState.isOpen}
        onClose={qrModalState.onClose}
        onScanJoinCode={onScanJoinCode}
      />

      <Stack
        justifyContent="start"
        alignContent="center"
        alignItems="center"
        minHeight="100%"
        paddingBottom={10}
      >
        <LogoHeader width={200} />

        <Box bg={bg} padding={10} borderRadius={10} width={430} maxWidth="100%">
          <Heading size="lg">Join Game</Heading>
          <br />

          {!authCtx.loggedIn && <AuthFlowForm />}

          {authCtx.loggedIn && (
            <Stack spacing={5}>
              <Text fontSize="xl">
                Joining as{' '}
                <b>{authCtx.user ? authCtx.user.displayName : '--'}</b>
              </Text>

              {isMobile && (
                <>
                  <Button padding={10} onClick={() => qrModalState.onOpen()}>
                    <IoCamera size={25} />
                    <Text ml={2}>Scan QR Code</Text>
                  </Button>

                  {/* <Center>
                  <Text color="grey">— OR —</Text>
                </Center> */}
                </>
              )}

              <form onSubmit={handleJoinSubmit}>
                <Stack spacing={5}>
                  <FormControl isRequired isInvalid={Boolean(error.msg)}>
                    <Input
                      placeholder="Enter Game Code"
                      size="lg"
                      autoComplete="off"
                      autoCorrect="off"
                      value={joinCode}
                      type="text"
                      pattern="[A-Z0-9]+"
                      maxLength={6}
                      onChange={handleJoinCodeInput}
                    />
                    {error.msg && (
                      <FormErrorMessage>{error.msg}</FormErrorMessage>
                    )}
                  </FormControl>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    disabled={!error.retryable}
                    isLoading={joinLoading}
                    loadingText="Join Game"
                    type="submit"
                    size="lg"
                  >
                    Join Game
                  </Button>
                </Stack>
              </form>
            </Stack>
          )}
        </Box>
      </Stack>
    </>
  );
}
