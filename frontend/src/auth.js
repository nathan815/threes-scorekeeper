import { useState } from 'react';

/**
 * Hook for managing the auth flow (AuthFlowForm)
 */
export function useAuthFlow() {
  const [authState, setAuthState] = useState({
    option: null,
    optionInProgress: null,
    complete: false,
    displayName: null,
  });

  function selectAuthOption(option) {
    setAuthState({
      ...authState,
      option,
    });
  }

  function onLogin(option) {
    setAuthState({
      ...authState,
      optionInProgress: option
    });
    setTimeout(() => {
      // TEMP
      if (window.confirm('Simulate login success?')) {
        setAuthState({
          ...authState,
          option: option,
          optionInProgress: null
        });
      } else {
        setAuthState({
          ...authState,
          optionInProgress: null
        });
      }
    }, 500);
  }

  function onAuthFlowComplete(displayName) {
    if (displayName) {
      setAuthState({
        ...authState,
        complete: true,
        displayName,
      });
    }
  }

  return {
    state: authState,
    selectAuthOption,
    onLogin,
    onAuthFlowComplete,
  };
}
