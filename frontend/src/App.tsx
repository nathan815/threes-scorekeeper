import { Box } from '@chakra-ui/react';
import React from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { DevScreen } from './screens/Dev';
import Home from './screens/Home';
import { JoinGame } from './screens/JoinGame';
import { NewGame } from './screens/NewGame';

import { NavBar } from 'src/NavBar';
import { GameScreen } from './screens/game/Game';
import { PageNotFound } from './screens/PageNotFound';

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
      <NavBar />
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
