import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Tag,
  UseDisclosureProps,
} from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { GameAugmented } from '../../../services/game';
import { convertDisclosureProps } from '../../../utils/disclosure';
import { useWindowResizeCallback } from '../../../utils/hooks/useWindowResizeCallback';
import { CurrentRoundCardState, CurrentRoundCard } from '../CurrentRoundCard';

const CARD_EXTRA_VERT_SPACE = 150;
const CARD_HORZ_BUFFER = 50;
const CARD_MIN_HEIGHT = 350;
const CARD_ASPECT_RATIO = 0.7;

function calculateRoundCardModalWidth() {
  const height = Math.max(
    CARD_MIN_HEIGHT,
    window.innerHeight - CARD_EXTRA_VERT_SPACE
  );
  const width = height * CARD_ASPECT_RATIO;
  return Math.min(window.innerWidth - CARD_HORZ_BUFFER, width);
}

export function CurrentRoundCardModal({
  game,
  modalState,
  cardState,
}: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  cardState: CurrentRoundCardState;
}) {
  const modal = convertDisclosureProps(modalState);
  const [width, setWidth] = useState(calculateRoundCardModalWidth());

  useWindowResizeCallback(
    useCallback(() => {
      setWidth(calculateRoundCardModalWidth());
    }, [])
  );

  return (
    <Modal
      {...modal}
      size="full"
      closeOnOverlayClick={true}
      motionPreset="slideInBottom"
    >
      <ModalOverlay background="blackAlpha.800" />
      <ModalContent
        background=""
        boxShadow="none"
        py="10px"
        onClick={modal.onClose}
      >
        <ModalCloseButton />
        <ModalBody>
          <Flex
            direction="column"
            justifyContent="start"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <CurrentRoundCard
              game={game}
              state={cardState}
              cardContainerProps={{
                width: `${width}px`,
                height: 'auto',
                mb: 5,
                className: 'no-shadow',
              }}
            />
            {game.dealerPerfectCutCards > 0 && (
              <Tag size="lg" textAlign="center">
                Dealer perfect cut: {game.dealerPerfectCutCards} cards
              </Tag>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
