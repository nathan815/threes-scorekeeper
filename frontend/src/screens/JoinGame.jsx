import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Text,
  Center,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  IoArrowForward,
  IoCamera,
  IoLogoApple,
  IoLogoGoogle,
  IoPerson,
} from 'react-icons/io5';
import { LogoHeader } from '../components/LogoHeader';
import { JoinGameQrCodeScannerModal } from '../components/JoinGameQrCodeScannerModal';

export function AuthStep({ authState, selectAuthOption, onLogin, onComplete }) {
  const { option, optionInProgress, displayName } = authState;
  const [displayNameInput, setDisplayNameInput] = useState('');

  const buttonsDisabled = optionInProgress != null;

  const signInButtons = (
    <>
      <Button
        mt={4}
        onClick={() => onLogin('apple')}
        isLoading={optionInProgress === 'apple'}
        loadingText="Signing in with Apple..."
        type="submit"
        size="lg"
        disabled={buttonsDisabled}
        leftIcon={<IoLogoApple />}
      >
        Sign in with Apple
      </Button>
      <Button
        mt={4}
        onClick={() => onLogin('google')}
        isLoading={optionInProgress === 'google'}
        loadingText="Signing in with Google..."
        type="submit"
        size="lg"
        disabled={buttonsDisabled}
        leftIcon={<IoLogoGoogle />}
      >
        Sign in with Google
      </Button>
    </>
  );

  const selectedAuthService = { apple: 'Apple', google: 'Google' }[
    option || optionInProgress
  ];

  if (option == null) {
    return (
      <Stack spacing={5}>
        <Text>To join a game, please identify yourself first.</Text>
        <Button
          mt={4}
          isLoading={false}
          type="submit"
          size="lg"
          onClick={() => selectAuthOption('guest')}
          disabled={buttonsDisabled}
          leftIcon={<IoPerson />}
        >
          Use as Guest
        </Button>
        {signInButtons}
      </Stack>
    );
  } else if (!displayName) {
    return (
      <Stack spacing={5}>
        <Text>
          {option === 'guest'
            ? 'Please enter your name. This is how others will see you.'
            : `Signed in with ${selectedAuthService}. Next, please enter your name.  This is how others will see you.`}
        </Text>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onComplete(displayNameInput);
          }}
        >
          <Stack spacing={5}>
            <FormControl isRequired>
              <Input
                id="display-name"
                placeholder="Enter your name"
                size="lg"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                autoFocus
              />
              {option !== 'guest' && (
                <FormHelperText>
                  This will be saved in your account.
                </FormHelperText>
              )}
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              isLoading={false}
              type="submit"
              size="lg"
              disabled={buttonsDisabled}
            >
              {option === 'guest' ? 'Continue as Guest' : 'Continue'}
            </Button>
          </Stack>
        </form>
        {option === 'guest' && (
          <>
            <Center>
              <Text color="grey">— OR —</Text>
            </Center>
            {signInButtons}
          </>
        )}
      </Stack>
    );
  } else {
    return (
      <Text>
        Joining as <b>{displayName}</b>
      </Text>
    );
  }
}

export function JoinGame() {
  const [authState, setAuthState] = useState({
    option: null,
    optionInProgress: null,
    complete: false,
    displayName: null,
  });
  const [joinCode, setJoinCode] = useState('');
  const qrModalState = useDisclosure();

  const selectAuthOption = (option) => {
    setAuthState({
      ...authState,
      option,
    });
  };

  const onLogin = (option) => {
    setAuthState({
      ...authState,
      optionInProgress: option,
    });
    setTimeout(() => {
      // TEMP
      if (window.confirm('Simulate login success?')) {
        setAuthState({
          ...authState,
          option: option,
          optionInProgress: null,
        });
      } else {
        setAuthState({
          ...authState,
          optionInProgress: null,
        });
      }
    }, 500);
  };

  const onAuthComplete = (displayName) => {
    if (displayName) {
      setAuthState({
        ...authState,
        complete: true,
        displayName,
      });
    }
  };

  const onCodeSubmit = () => {};

  const onScanJoinCode = (code) => {
    setJoinCode(code);
    onCodeSubmit();
  };

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
          <AuthStep
            selectAuthOption={selectAuthOption}
            authState={authState}
            onLogin={onLogin}
            onComplete={onAuthComplete}
          />
          {authState.complete && (
            <Stack spacing={5} mt={5}>
              <Button
                padding={10}
                bgColor="#eee"
                onClick={() => {
                  qrModalState.onOpen();
                  console.log('hi');
                }}
              >
                <IoCamera size={25} />
                <Text ml={2}>Scan QR Code</Text>
              </Button>

              <Center>
                <Text color="grey">— OR —</Text>
              </Center>

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
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </FormControl>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    isLoading={false}
                    type="submit"
                    size="lg"
                    rightIcon={<IoArrowForward />}
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
