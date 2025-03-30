import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import createCache from '@emotion/cache';
import { CacheProvider, Global } from '@emotion/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { prefixer } from 'stylis';
import App from './App';
import { AuthProvider } from './auth/authContext';
import * as styles from './index.css';
import reportWebVitals from './reportWebVitals';
import theme from './theme';

const myCache = createCache({
  key: 'emotion-cache',
  stylisPlugins: [prefixer],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CacheProvider value={myCache}>
    <ChakraProvider theme={theme}>
      <Global styles={styles} />
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    </ChakraProvider>
  </CacheProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
