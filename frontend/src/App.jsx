import {
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import React from 'react';
import { IoCaretDown } from 'react-icons/io5';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import {
  BrowserRouter,
  Link as RouterLink,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { useAuthContext } from './auth/authContext';
import Home from './screens/Home';
import { JoinGame } from './screens/JoinGame';
import { NewGame } from './screens/NewGame';

import { GameScreen } from './screens/Game';
import { PageNotFound } from './screens/PageNotFound';
import './style/global.css';

const MAX_WIDTH = '5xl';

function ScreenContainer() {
  return (
    <Container maxWidth={MAX_WIDTH} height="100%">
      <Outlet />
    </Container>
  );
}

function AuthOptionMenu() {
  const authCtx = useAuthContext();
  const toast = useToast();
  return authCtx.user ? (
    <Menu>
      <MenuButton as={Button} rightIcon={<IoCaretDown />}>
        {authCtx.user.displayName}
      </MenuButton>
      <MenuList>
        <MenuItem as={RouterLink} to="/games">
          My Games
        </MenuItem>
        <MenuItem
          onClick={() =>
            toast({
              description: 'Change name functionality coming soon',
              position: 'top',
            })
          }
        >
          Change Name
        </MenuItem>
        {!authCtx.user.isGuest && <MenuItem>Logout</MenuItem>}
      </MenuList>
    </Menu>
  ) : (
    <></>
  );
}

function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <BrowserRouter>
      <Box position="fixed" top={15} left={15}>
        <IconButton
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <MdLightMode /> : <MdDarkMode />}
          aria-label={'Toggle Dark Mode'}
        />
      </Box>
      <Box position="fixed" top={15} right={15}>
        <AuthOptionMenu />
      </Box>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/" element={<ScreenContainer />}>
          <Route path="/new" element={<NewGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/join/:gameId" element={<JoinGame />} />
          <Route path="/games/:gameId" element={<GameScreen />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
