import {
  Box,
  BoxProps,
  Button,
  DarkMode,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
  UseDisclosureProps,
} from '@chakra-ui/react';
import React from 'react';
import { IoCaretDown, IoMenuSharp } from 'react-icons/io5';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthContext } from 'src/auth/authContext';
import { AuthFlowForm } from 'src/components/AuthFlowForm';
import { Logo } from 'src/components/Logo';
import { UserSettingsModal } from 'src/screens/UserSettingsModal';
import { convertDisclosureProps } from 'src/utils/disclosure';

function AuthOptionMenu({ onSignIn }: { onSignIn: () => void }) {
  const authCtx = useAuthContext();
  const settingsModalState = useDisclosure();

  if (!authCtx?.user) {
    return (
      <Button variant="ghost" onClick={onSignIn}>
        Sign In
      </Button>
    );
  }

  return (
    <>
      <UserSettingsModal modalState={settingsModalState} />
      <Menu>
        <MenuButton as={Button} rightIcon={<IoCaretDown />} variant="ghost">
          {authCtx.user.displayName}
        </MenuButton>
        <MenuList color="white">
          <MenuItem as={RouterLink} to="/games">
            My Games
          </MenuItem>
          <MenuItem
            onClick={() => {
              settingsModalState.onOpen();
            }}
          >
            Settings
          </MenuItem>
          {!authCtx.user.isGuest && (
            <MenuItem onClick={() => authCtx.logOut()}>Sign Out</MenuItem>
          )}
          <MenuDivider />
          <MenuItem
            title="Copy to clipboard"
            fontSize="sm"
            onClick={() =>
              authCtx?.user && navigator.clipboard.writeText(authCtx.user.id)
            }
          >
            ID: {authCtx.user.id}
          </MenuItem>
          <MenuItem as={RouterLink} to="/dev" fontSize="sm">
            Developer
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}

function AuthModal({ modalState }: { modalState: UseDisclosureProps }) {
  const modal = convertDisclosureProps(modalState);
  return (
    <Modal {...modal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <ModalCloseButton />
          Sign In
        </ModalHeader>

        <ModalBody>
          <AuthFlowForm onComplete={() => modal.onClose()} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

function NavBarLogo(props: BoxProps) {
  return (
    <Box {...props}>
      <RouterLink to="/" className="navbar-logo">
        <Logo width="auto" height="55px" forceColorMode="dark" />
      </RouterLink>
    </Box>
  );
}

export function NavBar({ showLogo = true }: { showLogo?: boolean }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const authModalState = useDisclosure();
  return (
    <>
      <AuthModal modalState={authModalState} />
      <DarkMode>
        <Flex
          as="nav"
          role="nav"
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
                Create
              </Button>
            </HStack>
            <HStack
              spacing={2}
              display={{ base: 'flex', md: 'none' }}
              width="full"
            >
              <NavBarLogo
                display={showLogo ? { base: 'flex', md: 'none' } : 'none'}
              />
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<IoMenuSharp />}
                  variant="ghost"
                  size="lg"
                />
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

          <NavBarLogo
            display={showLogo ? { base: 'none', md: 'flex' } : 'none'}
          />

          <HStack flex={1} justifyContent="right">
            <IconButton
              onClick={toggleColorMode}
              icon={colorMode === 'light' ? <MdLightMode /> : <MdDarkMode />}
              aria-label={'Toggle Dark Mode'}
              variant="ghost"
              // display={{ base: 'none', md: 'flex' }}
            />
            <AuthOptionMenu onSignIn={() => authModalState.onOpen()} />
          </HStack>
        </Flex>
      </DarkMode>
    </>
  );
}
