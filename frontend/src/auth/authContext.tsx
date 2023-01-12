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

type CompleteOAuthLoginFn = (user: AuthUser) => void;
type CompleteOAuthRegisterFn = (user: AuthUser, displayName: string) => void;

type AuthCtx = {
  guestLogin: (displayName: string) => Promise<AuthUser>;
  completeOauthLogin: CompleteOAuthLoginFn;
  completeOauthRegister: CompleteOAuthRegisterFn;
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
          })
          .catch((err) => {
            console.error('failed guest login', err);
          });
      } else {
        setAuth({
          loggedIn: Boolean(serverAuth.user),
          user: serverAuth.user,
        });
      }
    });
  }, []);

  const guestLogin = async (displayName) => {
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
  };

  const completeOauthLogin = (user: AuthUser) => {
    setAuth({
      loggedIn: true,
      user: user,
    });
  };

  const completeOauthRegister = (user: AuthUser, displayName: string) => {
    // TODO send request to update display name
    setAuth({
      loggedIn: true,
      user: user,
    });
  };

  const logOut = async () => {
    await api.logout();
    setAuth({
      loggedIn: false,
      user: null,
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

  const ctx = {
    ...auth,
    guestLogin,
    completeOauthLogin,
    completeOauthRegister,
    logOut,
    setAuthFlow,
  };

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
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
          ...DEFAULT_AUTH_STATE,
          loggedIn: auth.loggedIn || false,
          user: auth.user || null,
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
      token: auth.token,
    })
  );
}
