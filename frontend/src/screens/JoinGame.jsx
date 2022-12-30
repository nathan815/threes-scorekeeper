import {
  Box,
  Button,
  Center,
  FormControl,
  FormHelperText,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { IoCamera } from 'react-icons/io5';
import { AuthFlowForm } from '../components/AuthFlowForm';
import { JoinGameQrCodeScannerModal } from '../components/JoinGameQrCodeScannerModal';
import { LogoHeader } from '../components/LogoHeader';
import { isMobile } from 'react-device-detect';
import { useAuthContext } from '../auth/authContext';

export function JoinGame() {
  const authCtx = useAuthContext();
  const [joinCode, setJoinCode] = useState('');
  const qrModalState = useDisclosure();

  function onCodeSubmit() {}

  function onScanJoinCode(code) {
    setJoinCode(code);
    onCodeSubmit();
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

        <Box
          bg={useColorModeValue('whiteAlpha.900', 'blackAlpha.300')}
          padding={10}
          borderRadius={10}
          width={430}
          maxWidth="100%"
        >
          <Heading size="lg">Join game</Heading>
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

                  <Center>
                    <Text color="grey">— OR —</Text>
                  </Center>
                </>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onCodeSubmit();
                }}
              >
                <Stack spacing={5}>
                  <FormControl isRequired>
                    <Input
                      placeholder="Enter Code"
                      size="lg"
                      autoComplete="off"
                      autoCorrect="off"
                      value={joinCode}
                      type="text"
                      pattern="[A-Z0-9]+"
                      onChange={(e) =>
                        setJoinCode(
                          e.target.value.toUpperCase().replace(' ', '')
                        )
                      }
                    />
                  </FormControl>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    isLoading={false}
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
