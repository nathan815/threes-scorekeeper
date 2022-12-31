import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { api } from '../api';

/***
 * @typedef {'guest' | 'apple' | 'google'} AuthOption
 *
 *
 * @typedef {{
 *  option: AuthOption
 *  optionInProgress: AuthOption
 *  finishLoginLoading: boolean
 * }} AuthFlowState
 *
 *
 * @typedef {{
 *  displayName: string
 *  isGuest: boolean
 *  id?: string
 *  providers?: Array<'apple' | 'google'>
 * }} AuthUser
 *
 *
 * @typedef {{
 *  loggedIn: boolean
 *  token: string | null
 *  user: AuthUser
 *  authFlow: AuthFlowState
 *  initialized: boolean
 * }} AuthState
 *
 *
 * @typedef {(displayName: string) => Promise<AuthUser>} LogInFunction
 *
 * @typedef {{
 *  finishLogIn: LogInFunction
 *  logOut: () => void
 *  setAuthFlow: (authFlow: Partial<AuthFlowState>) => void
 * } & AuthState} AuthContext
 */

/** @type {AuthState} */
const DEFAULT_AUTH_STATE = {
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
const AuthContext = React.createContext(undefined);

/** @type {() => AuthContext} */
export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [auth, setAuthData] = useState(DEFAULT_AUTH_STATE);

  /** @param {Partial<AuthState>} newData */
  const setAuth = (newData) => {
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

  /** @type {LogInFunction} */
  const finishLogIn = async (displayName) => {
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

  /** @param {AuthFlowState} newAuthFlow */
  const setAuthFlow = (newAuthFlow) => {
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
 * @returns {AuthState}
 */
function readPersistedAuth() {
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
 * @param {AuthState} auth
 */
function persistAuth(auth) {
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
