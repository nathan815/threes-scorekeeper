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
import React, { useState } from 'react';
import { IoLogoApple, IoLogoGoogle, IoPerson } from 'react-icons/io5';
import { openAuthPopupWindow } from 'src/auth/authPopup';
import { AuthUser, useAuthContext } from '../auth/authContext';

export function AuthFlowForm(props: {
  introText: string;
  onComplete?: () => void;
}) {
  const authCtx = useAuthContext();
  const toast = useToast();
  const authFlow = authCtx?.authFlow;
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [newUser, setNewUser] = useState<AuthUser | null>(null);

  const buttonsDisabled = authFlow?.optionInProgress != null;

  function selectAuthOption(option) {
    authCtx?.setAuthFlow({
      option,
    });
  }

  async function initiateProviderAuth(option: any) {
    if (!authCtx) return;

    authCtx.setAuthFlow({
      optionInProgress: option,
    });

    try {
      const result = await openAuthPopupWindow(option, displayNameInput);

      if (result.success) {
        authCtx.setAuthFlow({
          option: option,
          optionInProgress: null,
        });

        if (result.isNew) {
          setNewUser(result.user);
          if (displayNameInput === '') {
            setDisplayNameInput(result.user.displayName);
          }
        } else {
          authCtx.completeOauthLogin(result.user);
        }
      } else {
        toast({
          status: 'error',
          description: 'Error completing sign in',
        });
        authCtx.setAuthFlow({
          optionInProgress: null,
        });
      }
    } catch (err) {
      console.error('provider login failed', err);
      authCtx.setAuthFlow({
        optionInProgress: null,
      });
    }
  }

  function completeAuthRegister(displayName) {
    if (!displayName || !authCtx) {
      return;
    }
    if (authCtx?.authFlow.option === 'guest') {
      authCtx
        .guestLogin(displayName)
        .then((user) => {
          props.onComplete?.();
        })
        .catch((err) => {
          toast({
            title: 'An error occurred',
            description: `Failed to save display name. Please try again. (${err})`,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        });
    } else {
      if (newUser) {
        authCtx.completeOauthRegister(newUser, displayNameInput);
      }
    }
  }

  const signInButtons = (
    <>
      <Button
        mt={4}
        onClick={() => initiateProviderAuth('google')}
        isLoading={authFlow?.optionInProgress === 'google'}
        loadingText="Sign in with Google"
        type="submit"
        size="lg"
        disabled={buttonsDisabled && authFlow?.optionInProgress !== 'google'}
        leftIcon={<IoLogoGoogle />}
      >
        Sign in with Google
      </Button>
      {/* <Button
        mt={4}
        onClick={() => initiateProviderAuth('apple')}
        isLoading={authFlow?.optionInProgress === 'apple'}
        loadingText="Sign in with Apple"
        type="submit"
        size="lg"
        disabled={buttonsDisabled}
        leftIcon={<IoLogoApple />}
      >
        Sign in with Apple
      </Button> */}
    </>
  );

  const selectedAuthService = { apple: 'Apple', google: 'Google' }[
    authFlow?.option || authFlow?.optionInProgress || ''
  ];

  if (!authCtx || !authCtx.initialized) {
    return <Progress size="xs" isIndeterminate />;
  }

  const option = authFlow?.option;

  if (option == null && !authCtx.user && !newUser) {
    return (
      <Stack spacing={5}>
        <Text>{props.introText}</Text>
        {signInButtons}
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
      </Stack>
    );
  } else if (!authCtx.user || newUser) {
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
            completeAuthRegister(displayNameInput);
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
                minLength={3}
                maxLength={15}
              />
              {option !== 'guest' && (
                <FormHelperText>
                  This will be saved in your Threes account.
                </FormHelperText>
              )}
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              isLoading={authCtx.authFlow.finishLoginLoading}
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
  } else {
    return null;
  }
}

AuthFlowForm.propTypes = {};
