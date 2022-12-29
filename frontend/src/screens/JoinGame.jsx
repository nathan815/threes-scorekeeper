import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Text,
  Center,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  IoArrowForward,
  IoLogoApple,
  IoLogoGoogle,
  IoPerson,
} from 'react-icons/io5';
import { LogoHeader } from '../components/LogoHeader';

export function AuthStep({ authState, selectAuthOption, onLogin, onComplete }) {
  const { option, optionInProgress, displayName } = authState;
  const [displayNameInput, setDisplayNameInput] = useState('');

  const buttonsDisabled = optionInProgress != null;

  const signInButtons = (
    <>
      <Button
        mt={4}
        variant="black"
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
        variant="black"
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
          variant="black"
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
            ? 'You are joining as a guest. Please enter a display name.'
            : `You are signed in with ${selectedAuthService}. Please enter a display name.`}
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
                placeholder="Enter a display name"
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
              variant="black"
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
  const bg = useColorModeValue('whiteAlpha.900', 'blackAlpha.300');

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
      setAuthState({
        ...authState,
        option: option,
        optionInProgress: null,
      });
    }, 1000);
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
            <FormControl isRequired>
              <FormLabel>Which game are you joining?</FormLabel>
              <Input
                placeholder="Enter Join Code"
                size="lg"
                autoComplete="off"
                autoCorrect="off"
                autoFocus={true}
              />
              <FormHelperText>
                Tip: You can scan the host's QR code to join!
              </FormHelperText>
            </FormControl>
            <Button
              mt={4}
              variant="black"
              isLoading={false}
              type="submit"
              size="lg"
              rightIcon={<IoArrowForward />}
            >
              Join Game
            </Button>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
