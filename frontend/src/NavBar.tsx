import {
  useToast,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  useColorMode,
  DarkMode,
  Flex,
  HStack,
  IconButton,
  Box,
} from '@chakra-ui/react';
import React from 'react';
import { IoCaretDown, IoMenu } from 'react-icons/io5';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthContext } from 'src/auth/authContext';
import { Logo } from 'src/components/Logo';

function AuthOptionMenu() {
  const authCtx = useAuthContext();
  const toast = useToast();
  return authCtx?.user ? (
    <Menu>
      <MenuButton as={Button} rightIcon={<IoCaretDown />} variant="outline">
        {authCtx.user.displayName}
      </MenuButton>
      <MenuList color="white">
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
  ) : null;
}

export function NavBar({ showLogo = true }: { showLogo?: boolean }) {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <DarkMode>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        position="fixed"
        top={0}
        width="full"
        height="70px"
        paddingX={5}
        bg="darkGray"
        boxShadow="0 0 5px #111"
        className="navbar"
        zIndex={1}
      >
        <Box flex={1}>
          <HStack spacing={2} display={{ base: 'none', md: 'block' }}>
            <Button to="/join" as={RouterLink} variant="ghost">
              Join Game
            </Button>
            <Button to="/new" as={RouterLink} variant="ghost">
              New Game
            </Button>
          </HStack>
          <HStack spacing={2} display={{ base: 'block', md: 'none' }}>
            <Menu>
              <MenuButton as={IconButton} icon={<IoMenu />} variant="outline" />
              <MenuList color="white">
                <MenuItem to="/join" as={RouterLink}>
                  Join Game
                </MenuItem>
                <MenuItem to="/new" as={RouterLink}>
                  New Game
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        <RouterLink to="/" className="navbar-logo">
          <Logo
            width="auto"
            height="55px"
            visibility={showLogo ? 'visible' : 'hidden'}
            forceColorMode="dark"
          />
        </RouterLink>

        <HStack flex={1} justifyContent="right">
          <IconButton
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MdLightMode /> : <MdDarkMode />}
            aria-label={'Toggle Dark Mode'}
            variant="ghost"
            // display={{ base: 'none', md: 'flex' }}
          />
          <AuthOptionMenu />
        </HStack>
      </Flex>
    </DarkMode>
  );
}
