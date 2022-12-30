import {
  Button,
  Center,
  FormControl,
  FormHelperText,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { IoLogoApple, IoLogoGoogle, IoPerson } from 'react-icons/io5';
import PropTypes from 'prop-types';

export function AuthFlowForm({
  authState,
  selectAuthOption,
  onLogin,
  onComplete,
}) {
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
        <Text>Sign in to save your game history.</Text>
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
            : `Signed in with ${selectedAuthService}. Next, please enter your name. This is how others will see you.`}
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
  }
}

const loginOptions = PropTypes.oneOf(['guest', 'google', 'apple']);
AuthFlowForm.propTypes = {
  authState: PropTypes.shape({
    option: loginOptions,
    optionInProgress: loginOptions,
    displayName: PropTypes.string,
  }),
  selectAuthOption: PropTypes.func,
  onLogin: PropTypes.func,
  onComplete: PropTypes.func,
}
