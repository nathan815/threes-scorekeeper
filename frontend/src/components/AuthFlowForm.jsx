import {
  Button,
  Center,
  FormControl,
  FormHelperText,
  Input,
  Progress,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { IoLogoApple, IoLogoGoogle, IoPerson } from 'react-icons/io5';
import { useAuthContext } from '../auth/authContext';

export function AuthFlowForm() {
  const auth = useAuthContext();
  const { option, optionInProgress } = auth.authFlow;
  const [displayNameInput, setDisplayNameInput] = useState('');
  const toast = useToast();

  const buttonsDisabled = optionInProgress != null;

  function onSelectAuthOption(option) {
    auth.setAuthFlow({
      option,
    });
  }

  function onLogin(option) {
    auth.setAuthFlow({
      optionInProgress: option,
    });
    setTimeout(() => {
      // TEMP
      if (window.confirm('Simulate login success?')) {
        auth.setAuthFlow({
          option: option,
          optionInProgress: null,
        });
      } else {
        auth.setAuthFlow({
          optionInProgress: null,
        });
      }
    }, 500);
  }

  function onSubmitDisplayName(displayName) {
    if (!displayName) {
      return;
    }
    auth.finishLogIn(displayName).catch((err) => {
      toast({
        title: 'An error occurred',
        description: `Failed to save display name. Please try again. (${err})`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    });
  }

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

  if (!auth.initialized) {
    return <Progress size="xs" isIndeterminate />;
  }

  if (option == null && !auth.user) {
    return (
      <Stack spacing={5}>
        <Text>Sign in to save your game history.</Text>
        <Button
          mt={4}
          isLoading={false}
          type="submit"
          size="lg"
          onClick={() => onSelectAuthOption('guest')}
          disabled={buttonsDisabled}
          leftIcon={<IoPerson />}
        >
          Use as Guest
        </Button>
        {signInButtons}
      </Stack>
    );
  } else if (!auth.user || !auth.user.displayName) {
    return (
      <Stack spacing={5}>
        <Text>
          {option === 'guest'
            ? 'Please enter your name. This is how others will see you.'
            : `Signed in with ${selectedAuthService}. Next, please enter your name. This is how others will see you.`}
        </Text>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitDisplayName(displayNameInput);
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
              isLoading={auth.authFlow.finishLoginLoading}
              type="submit"
              size="lg"
              disabled={buttonsDisabled}
              loadingText="Saving name..."
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
  }
}

AuthFlowForm.propTypes = {};