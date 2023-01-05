import {
  Box,
  Button,
  ButtonGroup,
  Container,
  DarkMode,
  Flex,
  IconButton,
  LightMode,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import React from 'react';
import { IoCaretDown } from 'react-icons/io5';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import {
  BrowserRouter,
  Link,
  Link as RouterLink,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { useAuthContext } from './auth/authContext';
import Home from './screens/Home';
import { JoinGame } from './screens/JoinGame';
import { NewGame } from './screens/NewGame';
import { DevScreen } from './screens/Dev';

import { GameScreen } from './screens/Game';
import { PageNotFound } from './screens/PageNotFound';
import './style/global.css';
import { Logo } from './components/Logo';

function AuthOptionMenu() {
  const authCtx = useAuthContext();
  const toast = useToast();
  return authCtx?.user ? (
    <DarkMode>
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
          <MenuItem
            title="Copy to clipboard"
            onClick={() =>
              authCtx?.user && navigator.clipboard.writeText(authCtx.user.id)
            }
          >
            ID: {authCtx.user.id}
          </MenuItem>
          <MenuItem as={RouterLink} to="/dev">
            Developer
          </MenuItem>
          {!authCtx.user.isGuest && <MenuItem>Logout</MenuItem>}
        </MenuList>
      </Menu>
    </DarkMode>
  ) : null;
}

function Navbar({ showLogo = true }: { showLogo?: boolean }) {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      position="fixed"
      width="full"
      height="70px"
      paddingX={5}
      bg="darkGray"
      boxShadow="0 0 5px #111"
      className="navbar"
    >
      <Link to="/" className="navbar-logo">
        <Logo
          width="100%"
          height="100%"
          visibility={showLogo ? 'visible' : 'hidden'}
          forceColorMode="dark"
        />
      </Link>
      <Box>
        <DarkMode>
          <ButtonGroup>
            <IconButton
              onClick={toggleColorMode}
              icon={colorMode === 'light' ? <MdLightMode /> : <MdDarkMode />}
              aria-label={'Toggle Dark Mode'}
              variant="ghost"
            />
            <AuthOptionMenu />
          </ButtonGroup>
        </DarkMode>
      </Box>
    </Flex>
  );
}

function DefaultScreenContainer() {
  return (
    <Box mt={75}>
      <Outlet />
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/games/:gameId" element={<GameScreen />} />
        <Route path="/" element={<DefaultScreenContainer />}>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/join/:gameId" element={<JoinGame />} />
          <Route path="/dev" element={<DevScreen />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
