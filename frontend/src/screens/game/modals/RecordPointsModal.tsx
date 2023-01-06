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
import {
  completeCurrentRound,
  GameAugmented,
  PlayerPerfectCutMap,
  PlayerPointsMap,
  savePlayerResults,
} from '../../../services/game';
import { convertDisclosureProps } from '../../../utils/disclosure';

export function RecordPointsModal(props: {
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
  const [playerPoints, setPlayerPoints] = useState<PlayerPointsMap>({});
  // TODO simplify perfect cut - dont need an obj.
  const [playerPerfectCut, setPlayerPerfectCut] =
    useState<PlayerPerfectCutMap>({});

  const anyPerfectCut = Object.values(playerPerfectCut).some((v) => v === true);

  const save = async (completeRound = false) => {
    setSaving(true);
    try {
      const updatedGame = await savePlayerResults(
        game.shortId,
        playerPoints,
        playerPerfectCut
      );

      if (updatedGame) {
        onGameUpdate(updatedGame);
        setDirty(false);

        if (completeRound) {
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
                Save
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
