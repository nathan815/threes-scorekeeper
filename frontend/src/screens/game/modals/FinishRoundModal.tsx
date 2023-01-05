import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  Text,
  UseDisclosureProps,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { mapValues } from 'lodash';
import React, { useEffect, useState } from 'react';
import { PlayerResultInput } from '../../../api';
import {
  completeCurrentRound,
  GameAugmented,
  recordPlayerResults,
} from '../../../services/game';
import { convertDisclosureProps } from '../../../utils/disclosure';

export type PlayerPointsState = { [userId: string]: string | number };
export type PlayerPerfectCutState = { [userId: string]: boolean };

function buildPlayerResult(
  playerPoints: PlayerPointsState,
  playerPerfectCut: PlayerPerfectCutState
): PlayerResultInput {
  const playerResults: PlayerResultInput = {};

  for (const [id, points] of Object.entries(playerPoints)) {
    playerResults[id] = playerResults[id] || {};
    const p = parseInt(`${points}`);
    if (p || p === 0) {
      playerResults[id].points = p;
    }
  }

  for (const [id, perfectCut] of Object.entries(playerPerfectCut)) {
    playerResults[id] = {
      ...playerResults[id],
      perfectDeckCut: Boolean(perfectCut),
      points: playerResults[id]?.points || 0,
    };
  }

  // console.log(playerResults);

  return playerResults;
}

export function FinishRoundModal(props: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  onGameUpdate: (game: GameAugmented) => void;
}) {
  const { game, onGameUpdate } = props;
  const toast = useToast();
  const modal = convertDisclosureProps(props.modalState);
  const { isOpen, onClose } = modal;
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [playerPoints, setPlayerPoints] = useState<PlayerPointsState>({});
  const [playerPerfectCut, setPlayerPerfectCut] =
    useState<PlayerPerfectCutState>({});

  const anyPerfectCut = Object.values(playerPerfectCut).some((v) => v === true);

  const save = async (complete = false) => {
    setSaving(true);
    try {
      const updatedGame = await submitPlayerResults(
        game.shortId,
        playerPoints,
        playerPerfectCut
      );

      if (updatedGame) {
        onGameUpdate(updatedGame);
        setDirty(false);

        if (complete) {
          onGameUpdate(await completeCurrentRound(game.shortId));
          toast({
            description: 'Round finished',
            status: 'success',
            position: 'top',
          });
        } else {
          toast({
            description: 'Points saved',
            status: 'success',
            position: 'top',
            duration: 2000,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Failed to save points',
        description: `${error}`,
        status: 'error',
        position: 'top',
      });
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    save(true);
    onClose();
  };

  useEffect(() => {
    if (!game || !isOpen || dirty) {
      return;
    }

    // Whenever the game object changes, we synchronize our input states.
    setPlayerPerfectCut(
      mapValues(
        game?.currentRoundObj?.playerResults,
        (r) => r.perfectCutBonus !== 0
      )
    );
    setPlayerPoints(
      mapValues(game?.currentRoundObj?.playerResults, (r) => r.cardPoints)
    );
  }, [game, isOpen, dirty]);

  if (!game) {
    return null;
  }

  const onChangePoints = (id: string, value) => {
    setPlayerPoints((prev) => ({
      ...prev,
      [id]: value,
    }));
    setDirty(true);
  };

  const onChangePerfectCut = (id: string, event) => {
    setPlayerPerfectCut((prev) => ({
      ...prev,
      [id]: event.target.checked,
    }));
    setDirty(true);
  };

  return (
    <Modal {...modal} blockScrollOnMount={false} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Record Points
          <ModalCloseButton />
        </ModalHeader>

        <form onSubmit={onSubmit}>
          <ModalBody>
            <Text>Record each player's points for this round.</Text>

            <Alert status="info" mt={3} mb={5} size="sm" fontSize="sm">
              <AlertIcon />
              <AlertDescription>
                If the dealer cut the deck perfectly at the start of the round,
                check the box to award the bonus.
              </AlertDescription>
            </Alert>

            <SimpleGrid minChildWidth="35%" spacing={5}>
              {game.players.map((player) => {
                const points = playerPoints[player.id];
                const cutBonus = playerPerfectCut[player.id];
                return (
                  <VStack key={player.id}>
                    <FormControl flexDir="column">
                      <FormLabel>{player.displayName}</FormLabel>
                      <NumberInput
                        value={
                          points === undefined || points === null ? '' : points
                        }
                        onChange={(value) => onChangePoints(player.id, value)}
                        min={0}
                        max={150}
                        isRequired={true}
                      >
                        <NumberInputField
                          id={`score-${player.id}`}
                          placeholder="Card Points"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <Checkbox
                        isChecked={cutBonus}
                        onChange={(e) => onChangePerfectCut(player.id, e)}
                        isDisabled={!cutBonus && anyPerfectCut}
                      >
                        Perfect Cut <Badge>-20</Badge>
                      </Checkbox>
                    </FormControl>
                  </VStack>
                );
              })}
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button disabled={!dirty || saving} onClick={() => save()}>
                Apply
              </Button>
              <Button disabled={saving} colorScheme="blue" type="submit">
                Save & Finish Round
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

/**
 * Submit provided player results to the server.
 */
async function submitPlayerResults(
  gameId: string,
  playerPoints: PlayerPointsState,
  playerPerfectCut: PlayerPerfectCutState
): Promise<GameAugmented | undefined> {
  const results = buildPlayerResult(playerPoints, playerPerfectCut);
  // console.log('submitPlayerResults', gameId, results);
  if (Object.keys(results).length > 0) {
    return recordPlayerResults(gameId, results);
  }
}
