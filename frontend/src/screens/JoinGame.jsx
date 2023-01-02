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
  useToast,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { IoArrowForward, IoCamera } from 'react-icons/io5';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuthContext } from '../auth/authContext';
import { AuthFlowForm } from '../components/AuthFlowForm';
import { JoinGameQrCodeScannerModal } from '../components/JoinGameQrCodeScannerModal';
import { LogoHeader } from '../components/LogoHeader';

export function JoinGame() {
  const { gameId: gameIdParam } = useParams();
  const authCtx = useAuthContext();
  const toast = useToast();
  const navigate = useNavigate();
  const qrModalState = useDisclosure();
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.300');
  const [joinCode, setJoinCode] = useState(gameIdParam);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState({ msg: null, retryable: true });
  const [showViewGameBtn, setShowViewGameBtn] = useState(false);

  const clearError = () => {
    setError({ msg: null, retryable: true });
    setShowViewGameBtn(false);
  };

  const joinGame = useCallback(
    async (code) => {
      clearError();
      setJoinLoading(true);
      try {
        await api.joinGame(code);
        if (!toast.isActive('joined')) {
          toast({
            id: 'joined',
            description: 'You have joined this game!',
            status: 'success',
            position: 'bottom',
          });
        }
        navigate(`/games/${code}`, { replace: true });
      } catch (err) {
        console.error(err, err.message);
        let msg = 'An error occurred. Please try again in a moment.';
        let retryable = true;
        if (err instanceof ApiError) {
          if (
            err.context &&
            err.context.errorType === 'IllegalGameStageError'
          ) {
            retryable = false;
            msg = `This game has already started so you won't be able to join it.`;
            setShowViewGameBtn(true);
          } else if (err.message) {
            msg = `${err.message}`;
          }
        }
        setError({ msg, retryable });
      } finally {
        setJoinLoading(false);
      }
    },
    [navigate, toast]
  );

  useEffect(() => {
    if (gameIdParam) {
      joinGame(gameIdParam);
    }
  }, [joinGame, gameIdParam]);

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
    [authCtx.user, joinCode, joinLoading, joinGame]
  );

  function handleJoinCodeInput(event) {
    clearError();
    setJoinCode(event.target.value.toUpperCase().replace(' ', ''));
  }

  function onScanJoinCode(code) {
    setJoinCode(code);
    joinGame(code);
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
                  {showViewGameBtn && (
                    <Button
                      type="button"
                      as={RouterLink}
                      to={`/games/${joinCode}`}
                      mt={4}
                      colorScheme="blue"
                      size="lg"
                      rightIcon={<IoArrowForward />}
                    >
                      View Game
                    </Button>
                  )}
                </Stack>
              </form>
            </Stack>
          )}
        </Box>
      </Stack>
    </>
  );
}
