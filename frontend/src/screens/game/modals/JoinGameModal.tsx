import {
  Box,
  Button,
  ButtonGroup,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useBreakpointValue,
  UseDisclosureProps,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useAuthContext } from 'src/auth/authContext';
import { GameAugmented, updateGame } from 'src/services/game';
import { convertDisclosureProps } from 'src/utils/disclosure';
import { AuthFlowForm } from 'src/components/AuthFlowForm';

export function JoinGameModal(props: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  onJoinGame: () => Promise<GameAugmented | undefined>;
}) {
  const { game, modalState, onJoinGame } = props;
  const authCtx = useAuthContext();
  const toast = useToast();
  const modal = convertDisclosureProps(modalState);
  const [loading, setLoading] = useState(false);

  const joinable = !game.hasStarted;
  const needsAuth = joinable && !authCtx?.loggedIn;

  const onClickJoin = async () => {
    setLoading(true);
    try {
      if (await onJoinGame()) {
        modal.onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      {...modal}
      blockScrollOnMount={false}
      isCentered={useBreakpointValue({ base: true, lg: false })}
      size={{ base: 'xs', md: 'md' }}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          Join Game
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody>
          {needsAuth && (
            <Box pb={5}>
              <AuthFlowForm
                introText="To join this game, please select an option. Your game history will be saved if you sign in."
                onComplete={() => window.scrollTo(0, 0)}
              />
            </Box>
          )}

          {!needsAuth && (
            <Box>
              {joinable && (
                <Text>
                  Do you want to join this game as player{' '}
                  <i>{authCtx?.user?.displayName}</i>?
                </Text>
              )}

              {!joinable && (
                <Text>
                  This game has already started so you will not be able to join
                  it.
                </Text>
              )}
            </Box>
          )}
        </ModalBody>

        {!needsAuth && (
          <ModalFooter>
            <ButtonGroup>
              <Button type="button" onClick={modal.onClose}>
                {joinable ? 'Cancel' : 'OK'}
              </Button>
              {joinable && (
                <Button
                  colorScheme="blue"
                  isLoading={loading}
                  onClick={onClickJoin}
                >
                  Join Game
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
