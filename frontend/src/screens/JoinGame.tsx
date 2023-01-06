import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { IoArrowForward, IoCamera } from 'react-icons/io5';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { getGameCached } from 'src/services/game';
import { ApiError } from '../api';
import { JoinGameQrCodeScannerModal } from '../components/JoinGameQrCodeScannerModal';
import { LogoHeader } from '../components/Logo';

export function JoinGame() {
  const { gameId: gameIdParam } = useParams();
  const navigate = useNavigate();
  const qrModalState = useDisclosure();
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.300');
  const [gameIdInput, setGameIdInput] = useState(gameIdParam || '');
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<{
    msg: string | null;
    retryable: boolean;
  }>({ msg: null, retryable: true });

  const clearError = () => {
    setError({ msg: null, retryable: true });
  };

  const navigateJoinGame = useCallback(
    ({
      id,
      confirm = false,
      replace = false,
    }: {
      id: string;
      confirm?: boolean;
      replace?: boolean;
    }) =>
      navigate(`/games/${id}?join=true&confirm=${confirm}`, {
        replace: replace,
      }),
    [navigate]
  );

  useEffect(() => {
    if (gameIdParam) {
      navigateJoinGame({ id: gameIdParam, confirm: true, replace: true });
    }
  }, [navigateJoinGame, gameIdParam]);

  const handleJoinSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (joinLoading || !gameIdInput) {
        return;
      }
      setJoinLoading(true);
      try {
        await getGameCached(gameIdInput);
        navigateJoinGame({ id: gameIdInput });
      } catch (err) {
        if (err instanceof ApiError) {
          setError({ msg: err.message, retryable: err.retryable });
        } else {
          setError({ msg: 'Something went wrong.', retryable: true });
        }
      } finally {
        setJoinLoading(false);
      }
    },
    [gameIdInput, joinLoading, navigateJoinGame]
  );

  function handleJoinCodeInput(event) {
    clearError();
    setGameIdInput(event.target.value.toUpperCase().replace(' ', ''));
  }

  function onScanJoinCode(code) {
    setGameIdInput(code);
    navigateJoinGame({ id: code, confirm: true });
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

          <Stack spacing={5}>

            {isMobile && (
              <>
                <Button padding={10} onClick={() => qrModalState.onOpen()}>
                  <IoCamera size={25} />
                  <Text ml={2}>Scan QR Code</Text>
                </Button>
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
                    value={gameIdInput}
                    type="text"
                    pattern="[A-Z0-9]+"
                    maxLength={6}
                    onChange={handleJoinCodeInput}
                  />
                  {error.msg && (
                    <FormErrorMessage>{error.msg}</FormErrorMessage>
                  )}
                  <FormHelperText>{`Ask anyone already in the game for the code${
                    isMobile ? ' or QR code' : ''
                  }.`}</FormHelperText>
                </FormControl>

                <Button
                  type="submit"
                  mt={4}
                  colorScheme="blue"
                  disabled={!error.retryable || joinLoading}
                  isLoading={joinLoading}
                  loadingText="Join Game"
                  size="lg"
                >
                  Join Game
                </Button>

              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </>
  );
}
