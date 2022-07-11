import { Container } from "@chakra-ui/react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import Home from "./screens/Home";
import JoinRoom from "./screens/JoinTable";
import NewRoom from "./screens/NewTable";

const MAX_WIDTH = "5xl";

function App() {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Container maxWidth={MAX_WIDTH}>
          <Routes>
            <Route path="/">
              <Route path="/" element={<Home />} />
              <Route path="/tables/new" element={<NewRoom />} />
              <Route path="/tables/join" element={<JoinRoom />} />
            </Route>
          </Routes>
        </Container>
      </BrowserRouter>
    </>
  );
}

export default App;
