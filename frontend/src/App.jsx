import { Box, Container, IconButton, useColorMode } from '@chakra-ui/react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './screens/Home';
import { JoinGame } from './screens/JoinGame';
import { NewGame } from './screens/NewGame';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

import './style/global.css';

const MAX_WIDTH = '5xl';

function ScreenContainer() {
  return (
    <Container maxWidth={MAX_WIDTH} height="100%">
      <Outlet />
    </Container>
  );
}

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <BrowserRouter>
        <Box position="fixed" top={15} left={15}>
          <IconButton
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MdLightMode /> : <MdDarkMode />}
            aria-label={'Toggle Dark Mode'}
            variant="outline"
          />
        </Box>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<ScreenContainer />}>
            <Route path="/games/new" element={<NewGame />} />
            <Route path="/games/join" element={<JoinGame />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
