import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { api } from '../api';

type AuthOption = 'guest' | 'apple' | 'google';

type AuthFlowState = {
  option: AuthOption | null;
  optionInProgress: AuthOption | null;
  finishLoginLoading: boolean;
};

export type AuthUser = {
  displayName: string;
  isGuest: boolean;
  id: string;
  providers?: Array<'apple' | 'google'>;
};

type AuthState = {
  loggedIn: boolean;
  token: string | null;
  user: AuthUser | null;
  authFlow: AuthFlowState;
  initialized: boolean;
};

type LogInFunction = (displayName: string) => Promise<AuthUser>;

type AuthCtx = {
  finishLogIn: LogInFunction;
  logOut: () => void;
  setAuthFlow: (authFlow: Partial<AuthFlowState>) => void;
} & AuthState;

const DEFAULT_AUTH_STATE: AuthState = {
  loggedIn: false,
  user: null,
  token: null,
  initialized: false,
  authFlow: {
    option: null,
    optionInProgress: null,
    finishLoginLoading: false,
  },
};
const AuthContext = React.createContext<AuthCtx | undefined>(undefined);

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [auth, setAuthData] = useState(DEFAULT_AUTH_STATE);

  const setAuth = (newData: Partial<AuthState>) => {
    setAuthData((prevState) => {
      const newState = {
        ...prevState,
        ...newData,
      };
      if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
        persistAuth(newState);
      }
      console.log('prevState', prevState, 'newState', newState);
      return newState;
    });
  };

  useEffect(() => {
    console.log('UseEffect');
    const savedAuth = readPersistedAuth();
    setAuthData(savedAuth);

    // Get auth state from server
    api.getAuthState().then((serverAuth) => {
      console.log('serverAuth', serverAuth);
      if (
        !serverAuth.user &&
        savedAuth.user &&
        savedAuth.user.isGuest &&
        savedAuth.token
      ) {
        // Guest user: login again if the session ended and we have a guest token saved
        api
          .guestLogin({
            id: savedAuth.user.id,
            secret: savedAuth.token,
          })
          .then((loginResponse) => {
            setAuth({
              loggedIn: Boolean(loginResponse.user),
              user: loginResponse.user,
            });
          });
      } else {
        setAuth({
          loggedIn: Boolean(serverAuth.user),
          user: serverAuth.user,
        });
      }
    });
  }, []);

  useEffect(() => {}, []);

  const finishLogIn: LogInFunction = async (displayName) => {
    if (auth.authFlow.option === 'guest') {
      setAuth({
        authFlow: {
          ...auth.authFlow,
          finishLoginLoading: true,
        },
      });
      try {
        const result = await api.guestRegister(displayName);
        setAuth({
          loggedIn: true,
          token: result.guestSecret,
          user: result.user,
        });
        return result.user;
      } finally {
        setAuth({
          authFlow: {
            ...auth.authFlow,
            finishLoginLoading: false,
          },
        });
      }
    } else {
      // TODO implement saving of oauth account display name
      const user = {
        displayName,
        isGuest: false,
        id: '',
      };
      setAuth({
        loggedIn: true,
        user: user,
      });
      return user;
    }
  };

  const logOut = () => {
    setAuth({
      loggedIn: false,
    });
  };

  const setAuthFlow = (newAuthFlow: AuthFlowState) => {
    console.log('newAuthFlow', newAuthFlow);
    setAuth({
      authFlow: {
        ...auth.authFlow,
        ...newAuthFlow,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        finishLogIn,
        logOut,
        setAuthFlow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Reads auth state persisted in Local Storage
 */
function readPersistedAuth(): AuthState {
  const authJson = window.localStorage.getItem('auth');
  if (authJson) {
    try {
      const auth = JSON.parse(authJson);
      if (auth) {
        return {
          loggedIn: auth.loggedIn || false,
          user: auth.user || null,
          authFlow: {
            ...DEFAULT_AUTH_STATE.authFlow,
            ...auth.authFlow,
          },
          token: auth.token || null,
          initialized: true,
        };
      }
    } catch (err) {
      console.error(err);
    }
  }
  return { ...DEFAULT_AUTH_STATE, initialized: true };
}

/**
 * Persists auth state to Local Storage
 */
function persistAuth(auth: AuthState) {
  window.localStorage.setItem(
    'auth',
    JSON.stringify({
      loggedIn: auth.loggedIn,
      user: auth.user,
      authFlow: {
        option: auth.authFlow.option,
        optionInProgress: auth.authFlow.optionInProgress,
      },
      token: auth.token,
    })
  );
}
