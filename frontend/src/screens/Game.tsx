import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  AvatarProps,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Container,
  Flex,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  UseDisclosureProps,
  useToast,
  VStack,
  ModalBody,
  ModalHeader,
  ModalFooter,
  FormLabel,
  FormControl,
  NumberInput,
  NumberInputField,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper,
  Checkbox,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { mapValues} from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconBaseProps } from 'react-icons';
import { BsChevronDoubleRight } from 'react-icons/bs';
import {
  IoCaretDown,
  IoCheckmark,
  IoEllipsisHorizontalOutline,
  IoEnter,
  IoHourglass,
  IoPersonAdd,
  IoPlay,
  IoQrCodeOutline,
  IoSettings,
} from 'react-icons/io5';
import { MdStars } from 'react-icons/md';
import QRCode from 'react-qr-code';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, PlayerResultInput } from '../api';
import { useAuthContext } from '../auth/authContext';
import { ALL_SUITS, CardIcon, CardSuit } from '../components/CardIcon';
import { DataTable } from '../components/DataTable';
import {
  completeCurrentRound,
  GameAugmented,
  GameRoundAugmented,
  getGameCached,
  PlayerAugmented,
  PlayerResultAugmented,
  recordPlayerResults,
  startGame,
} from '../services/game';

import './Game.css';

interface PlayerAvatarProps extends AvatarProps {
  player: PlayerAugmented;
}
function PlayerAvatar({ player, ...props }: PlayerAvatarProps) {
  return (
    <Avatar
      name={player.displayName}
      src={`https://www.gravatar.com/avatar/${player.gravatarHash}?d=robohash&size=1`}
      bg="white"
      {...props}
    />
  );
}

function GameRoundCard({
  round,
  cardSuit = 'spades',
  ...iconProps
}: { round?: GameRoundAugmented; cardSuit?: CardSuit } & IconBaseProps) {
  if (!round) {
    return null;
  }
  return <CardIcon rank={round.cardRank} suit={cardSuit} {...iconProps} />;
}

const roundStatusDisplays = {
  finished: {
    label: 'Finished',
    icon: () => <IoCheckmark />,
  },
  inProgress: {
    label: 'In Progress',
    icon: () => <IoHourglass className="spin-infinite" />,
  },
  notStarted: {
    label: 'Not Started',
    icon: null,
  },
};

function rankToName(round: GameRoundAugmented): string | undefined {
  return {
    11: 'Jacks',
    12: 'Queens',
    13: 'Kings',
  }[round.cardRank];
}

function RoundDescriptionCell({ round }: { round: GameRoundAugmented }) {
  const statusDisplay = roundStatusDisplays[round.status];
  const name = rankToName(round);
  return (
    <Tooltip
      label={`${name || round.cardRank} - ${statusDisplay.label}`}
      placement="right"
      shouldWrapChildren={true}
    >
      <HStack cursor="default">
        <GameRoundCard round={round} size={35} />
        <Text>{name ? name.substring(0, 1) : round.cardRank}</Text>
        {statusDisplay.icon && statusDisplay.icon()}
      </HStack>
    </Tooltip>
  );
}

function PlayerResultCell({ result }: { result: PlayerResultAugmented }) {
  const bonusColor = useColorModeValue('black', 'white');
  if (!result) {
    return <IoEllipsisHorizontalOutline />;
  }
  const bonus = result.bonusPoints !== 0 && (
    <Text as="span" color={bonusColor}>{`${result.bonusPoints}`}</Text>
  );
  return (
    <>
      <Text color="grey" fontSize="sm" fontFamily="monospace">
        {result.previousTotal}+{result.cardPoints || 0}
        {bonus}=
      </Text>
      <Text fontSize="md">{result.newTotal}</Text>
    </>
  );
}

function buildRoundsTableColumns(game: GameAugmented) {
  const columnHelper = createColumnHelper<GameRoundAugmented>();
  const playerCols = game.players.map((player) => {
    return columnHelper.accessor((round) => round.playerResults[player.id], {
      id: player.id,
      header: () => (
        <HStack spacing={2} key={player.id}>
          <PlayerAvatar player={player} size="xs" />
          <Text>{player.displayName}</Text>
        </HStack>
      ),
      sortingFn: (a, b, _colId) => {
        const aVal = a.original.playerResults[player.id]?.netPoints || 0;
        const bVal = b.original.playerResults[player.id]?.netPoints || 0;
        return aVal - bVal;
      },
      cell: (cell) => <PlayerResultCell result={cell.getValue()} />,
    });
  });

  return [
    columnHelper.accessor((row) => row, {
      header: 'Round',
      cell: (col) => <RoundDescriptionCell round={col.getValue()} />,
    }),
    ...playerCols,
  ];
}

function GameQRCode({ id, ...boxProps }) {
  const qrCodeUrl = `${window.location.origin}/join/${id}`;
  return (
    <Box padding={5} bg="white" borderRadius={5} width="full" {...boxProps}>
      <QRCode value={qrCodeUrl} width="full" />
      <Text
        mt={5}
        fontSize="5xl"
        fontWeight="bold"
        letterSpacing={3}
        fontFamily="Monaco, monospace"
        lineHeight={1}
        textAlign="center"
        color="black"
      >
        {id}
      </Text>
    </Box>
  );
}

function CurrentRoundCard({ game }: { game: GameAugmented }) {
  const [suitIdx, setSuitIdx] = useState(0);
  const round = game?.currentRoundObj;

  useEffect(() => {
    if (round) {
      const changeSuit = () => {
        setSuitIdx((cur) => (cur + 1) % ALL_SUITS.length);
      };
      const timerId = setInterval(changeSuit, 3000);
      return () => clearTimeout(timerId);
    }
  }, [round]);

  if (!round) {
    return null;
  }

  return (
    <>
      {ALL_SUITS.map((suit, idx) => (
        <Box
          key={idx}
          display={idx === suitIdx ? 'block' : 'none'}
          style={{ marginTop: 0 }}
        >
          <GameRoundCard round={round} cardSuit={suit} size="100%" />
        </Box>
      ))}
    </>
  );
}

const tableMeta = {
  rowStyle: (row: any) => ({
    opacity: row.original.status === 'notStarted' ? 0.5 : 1,
  }),
};

function gameStatusText(game: GameAugmented) {
  if (game.endedAt) {
    return `Finished ${game.endedAt}`;
  }
  if (game.startedAt) {
    return 'Currently in progress';
  }
  if (game.ableToStart) {
    return 'Waiting for the host to start';
  }
  return 'Waiting for others to join';
}

type PlayerPointsState = { [userId: string]: string | number };
type PlayerPerfectCutState = { [userId: string]: boolean };

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

function FinishRoundModal(props: {
  game?: GameAugmented;
  modalState: UseDisclosureProps;
  onGameUpdate: (game: GameAugmented) => void;
}) {
  const toast = useToast();
  const { game, onGameUpdate } = props;
  // console.log('FinishRoundModal', game);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [playerPoints, setPlayerPoints] = useState<PlayerPointsState>({});
  const [playerPerfectCut, setPlayerPerfectCut] =
    useState<PlayerPerfectCutState>({});

  const anyPerfectCut = Object.values(playerPerfectCut).some((v) => v === true);

  const modalState = {
    ...props.modalState,
    isOpen: props.modalState.isOpen || false,
    onClose: () => props.modalState.onClose && props.modalState.onClose(),
  };
  const { isOpen, onClose } = modalState;

  const save = async (complete = false) => {
    if (!game) {
      return;
    }
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
        }
      }
    } catch (error) {
      toast({
        title: 'Failed to save points',
        description: `${error}`,
        status: 'error',
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
    <Modal
      {...modalState}
      blockScrollOnMount={false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Finish Round
          <ModalCloseButton />
        </ModalHeader>

        <form onSubmit={onSubmit}>
          <ModalBody>
            <Text>Record each player's points for this round.</Text>

            <Alert status="info" mt={3} mb={5} size="sm" fontSize="sm">
              <AlertIcon />
              <AlertDescription>
                If the dealer did a <i>perfect cut</i> of the deck at start of
                this round, check the box to award the bonus.
              </AlertDescription>
            </Alert>

            <SimpleGrid minChildWidth="35%" spacing={5}>
              {game.players.map((player) => {
                const points = playerPoints[player.id];
                // console.log(
                //   player.displayName,
                //   points,
                //   typeof points,
                //   'undefined?',
                //   points === undefined,
                //   'null?',
                //   points === null
                // );
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
                Save & Finish
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export function GameScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const authCtx = useAuthContext();
  const toast = useToast();
  const finishRoundModal = useDisclosure();
  const [game, setGame] = useState<GameAugmented>();
  const [showQrCode, setShowQrCode] = useState(false);
  const [showJsonData, setShowJsonData] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerId = useRef<number>();
  const [error, setError] = useState('');
  const [gameStarting, setGameStarting] = useState(false);

  const getGame = useCallback(() => {
    if (!gameId) {
      return;
    }
    getGameCached(gameId)
      .then((updatedGame) => {
        setError('');
        setGame(updatedGame);
        clearTimeout(timerId.current!);
        timerId.current = window.setTimeout(getGame, 2_000);
      })
      .catch((err) => {
        const retryable = err instanceof ApiError && err.retryable;
        clearTimeout(timerId.current!);
        if (retryable) {
          timerId.current = window.setTimeout(getGame, 10_000);
        }
        setError(`${err}`);
        if (!toast.isActive('game-load-error')) {
          toast({
            id: 'game-load-error',
            title: 'Failed to get game info',
            description: `${err}` + (retryable ? ' Retrying in 10s...' : ''),
            status: 'error',
            position: 'bottom-right',
            duration: 9_000,
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [toast, gameId]);

  useEffect(() => {
    getGame();
    return () => clearTimeout(timerId.current!);
  }, [getGame]);

  useEffect(() => {
    setShowQrCode(Boolean(game && !game.startedAt));
  }, [game]);

  const gameRounds = game?.rounds;
  const tableData = useMemo(() => gameRounds || [], [gameRounds]);
  const tableColumns = useMemo(
    () => (game ? buildRoundsTableColumns(game) : []),
    [game]
  );

  const currentUser = authCtx?.user;
  const currentPlayer: PlayerAugmented | null | undefined = useMemo(
    () =>
      game && currentUser && game.players.find((p) => p.id === currentUser?.id),
    [currentUser, game]
  );

  const showJoinGameBtn = useMemo(
    () =>
      game &&
      !game.players.map((player) => player.id).includes(currentUser?.id || ''),
    [game, currentUser]
  );

  const onClickGameStart = async () => {
    if (!game) {
      return;
    }
    setGameStarting(true);
    try {
      let updatedGame = await startGame(game?.shortId);
      setGame(updatedGame);
    } catch (err) {
      toast({
        title: 'Failed to start game',
        description: `${err.message || err}`,
        status: 'error',
      });
    }
    setGameStarting(false);
  };

  const onClickFinishRound = async () => {
    if (!game) {
      return;
    }
    finishRoundModal.onOpen();
  };

  return (
    <Container
      maxWidth="7xl"
      minHeight="100vh"
      bg={useColorModeValue('white', 'inherit')}
      boxShadow={useColorModeValue('0 0 5px #ccc', 'none')}
      paddingX={{ base: 5, lg: 10 }}
      paddingTop={100}
      paddingBottom={20}
    >
      <FinishRoundModal
        game={game}
        modalState={finishRoundModal}
        onGameUpdate={setGame}
      />
      <VStack align="flex-start" alignItems="start" width="100%">
        {loading && <Spinner size="xl" alignSelf="center" />}

        {!loading && !game && <Heading>{gameId}</Heading>}

        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && game && (
          <>
            <Stack
              direction={{ lg: 'row', base: 'column' }}
              justifyContent="space-between"
              width="100%"
            >
              <VStack
                className="sidebar"
                justifyContent="start"
                alignItems="center"
                mr={5}
                mb={5}
                width={{ lg: '30%', base: 'full' }}
              >
                <Card className="game-ctrl-box" width="full" size="sm" mb={5}>
                  <CardBody>
                    <Flex direction="column" alignItems="start" width="full">
                      <HStack spacing={1}>
                        <Heading size="md">Game</Heading>
                        <BsChevronDoubleRight />
                        <Heading size="md" fontWeight="normal">
                          {game.name}
                        </Heading>
                      </HStack>

                      <Text fontSize="sm" fontWeight="normal">
                        <b>{game.players.length}</b>{' '}
                        {`player${game.players.length > 1 ? 's' : ''}`} here
                      </Text>

                      <Text fontSize="sm" fontWeight="normal">
                        {gameStatusText(game)}
                      </Text>

                      <ButtonGroup flexWrap="wrap" mt={3} size="md">
                        {showJoinGameBtn && (
                          <Tooltip
                            label={
                              game.hasStarted
                                ? 'This game has already started.'
                                : 'Join this game'
                            }
                          >
                            <Button
                              onClick={() => navigate(`/join/${game?.shortId}`)}
                              colorScheme="blue"
                              leftIcon={<IoEnter />}
                              disabled={game.hasStarted}
                            >
                              Join
                            </Button>
                          </Tooltip>
                        )}

                        {currentPlayer?.isHost && (
                          <>
                            {!game.hasStarted && (
                              <Tooltip
                                label={
                                  game.ableToStart
                                    ? 'Start the game'
                                    : 'Need at least 2 players to start'
                                }
                              >
                                <Button
                                  colorScheme="green"
                                  leftIcon={<IoPlay />}
                                  disabled={!game.ableToStart || gameStarting}
                                  isLoading={gameStarting}
                                  loadingText="Start"
                                  onClick={onClickGameStart}
                                >
                                  Start
                                </Button>
                              </Tooltip>
                            )}

                            {!game.hasStarted && (
                              <Button
                                colorScheme="blue"
                                leftIcon={<IoPersonAdd />}
                              >
                                Add Player
                              </Button>
                            )}

                            {game.hasStarted && (
                              <Button
                                colorScheme="blue"
                                onClick={onClickFinishRound}
                              >
                                Finish Round
                              </Button>
                            )}
                          </>
                        )}

                        <Menu>
                          <MenuButton as={Button} rightIcon={<IoCaretDown />}>
                            <IoSettings />
                          </MenuButton>
                          <MenuList>
                            {currentPlayer?.isHost && (
                              <MenuItem
                                onClick={() =>
                                  toast({ title: 'Rename game WIP' })
                                }
                              >
                                Rename Game
                              </MenuItem>
                            )}

                            <MenuItem
                              onClick={() => setShowJsonData(!showJsonData)}
                            >
                              Toggle JSON
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </ButtonGroup>
                    </Flex>
                  </CardBody>
                </Card>

                <CurrentRoundCard game={game} />

                <Flex
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  mt={0}
                  mb={5}
                >
                  <GameQRCode
                    id={gameId}
                    display={showQrCode ? 'block' : 'none'}
                  />

                  <Button
                    size="sm"
                    mt={5}
                    leftIcon={<IoQrCodeOutline />}
                    onClick={() => setShowQrCode(!showQrCode)}
                  >
                    {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
                  </Button>
                </Flex>
              </VStack>

              <VStack
                className="content"
                justifyContent="start"
                alignContent="start"
                width={{ lg: '70%', base: 'full' }}
              >
                <Card size="sm" width="100%" mb={10}>
                  <CardBody>
                    <SimpleGrid minChildWidth="100px" spacingY={5}>
                      {game.players.map((player) => (
                        <Box
                          key={player.id}
                          display="flex"
                          alignItems="center"
                          flexDirection="column"
                        >
                          <PlayerAvatar player={player} mb={1} />
                          <Text fontSize="md" align="center">
                            {player.displayName}{' '}
                            {player.isHost ? (
                              <Text as="span" color="grey">
                                (host)
                              </Text>
                            ) : (
                              ''
                            )}
                          </Text>
                          <Tooltip
                            label={
                              `${player.points} points` +
                              (player.isWinner ? ' - First Place!' : '')
                            }
                            shouldWrapChildren={true}
                          >
                            <HStack
                              spacing={1}
                              alignContent="center"
                              alignItems="center"
                            >
                              <Badge fontSize="md">{player.points}</Badge>{' '}
                              {player.isWinner && (
                                <MdStars color="gold" fontSize={21} />
                              )}
                            </HStack>
                          </Tooltip>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
                <DataTable
                  columns={tableColumns}
                  data={tableData}
                  className="game-table"
                  size="sm"
                  options={{ meta: tableMeta }}
                />
              </VStack>
            </Stack>
          </>
        )}
        {showJsonData && (
          <Textarea
            fontFamily="monospace"
            value={JSON.stringify(game, null, 2)}
            rows={50}
          />
        )}
      </VStack>
    </Container>
  );
}
