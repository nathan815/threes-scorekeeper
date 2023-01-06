import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  AvatarBadge,
  AvatarProps,
  Badge,
  Box,
  Button,
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
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { CoreRow, createColumnHelper } from '@tanstack/react-table';
import { debounce } from 'lodash';
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
import { SlPencil } from 'react-icons/sl';
import QRCode from 'react-qr-code';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api';
import { AuthUser, useAuthContext } from '../../auth/authContext';
import { CardIcon } from '../../components/CardIcon';
import { DataTable } from '../../components/DataTable';
import {
  GameAugmented,
  GameRoundAugmented,
  getGameCached,
  PlayerAugmented,
  PlayerResultAugmented,
  startGame,
} from '../../services/game';
import {
  cardRankName,
  CardRankNumber,
  cardRankShortName,
  CardSuit,
} from '../../utils/card';
import { CurrentRoundCardModal } from './modals/CurrentRoundCardModal';

import './Game.css';
import { useCurrentRoundCardState, CurrentRoundCard } from './CurrentRoundCard';
import { RecordPointsModal } from './modals/RecordPointsModal';
import { TransferOwnershipModal } from './modals/TransferOwnershipModal';
import { ChangeGameNameModal } from './modals/ChangeGameNameModal';

interface PlayerAvatarProps extends AvatarProps {
  player: PlayerAugmented;
  showHostBadge?: boolean;
  showShadow?: boolean;
}
function PlayerAvatar({
  player,
  showHostBadge = false,
  showShadow = false,
  ...props
}: PlayerAvatarProps) {
  const shadow = useColorModeValue('0 0 5px #ccc', '0 0 5px #222');
  return (
    <Avatar
      name={player.displayName}
      src={`https://www.gravatar.com/avatar/${player.gravatarHash}?d=robohash&size=1`}
      bg="white"
      boxShadow={showShadow ? shadow : undefined}
      {...props}
    >
      {player.isHost && showHostBadge && (
        <AvatarBadge
          boxSize="1.5em"
          bg="blue.500"
          fontSize="0.8em"
          aria-label="Host"
          color="white"
        >
          H
        </AvatarBadge>
      )}
    </Avatar>
  );
}

function GameRoundCard({
  round,
  cardSuit = 'spades',
  ...iconProps
}: { round?: GameRoundAugmented; cardSuit?: CardSuit } & IconBaseProps) {
  const color = useColorModeValue('#232121', '#fff');
  if (!round) {
    return null;
  }
  return (
    <CardIcon
      rank={round.cardRank}
      suit={cardSuit}
      viewBox="91 36 333 440"
      fillOpacity={1}
      strokeOpacity={1}
      color={color}
      {...iconProps}
    />
  );
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

export function roundRankName(
  round: GameRoundAugmented,
  plural = false
): string | undefined {
  return cardRankName(round.cardRank as CardRankNumber, plural);
}

function roundRankShortName(round: GameRoundAugmented): string {
  return cardRankShortName(round.cardRank as CardRankNumber);
}

function RoundDescriptionCell({ round }: { round: GameRoundAugmented }) {
  const statusDisplay = roundStatusDisplays[round.status];
  return (
    <Tooltip
      label={`${roundRankName(round, true)} - ${statusDisplay.label}`}
      placement="right"
      shouldWrapChildren={true}
    >
      <HStack cursor="default">
        <GameRoundCard round={round} size={35} />
        <Text>{roundRankShortName(round)}</Text>
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
      <Text color="grey" fontSize="md" fontFamily="monospace">
        {result.previousTotal}+<b>{result.cardPoints || 0}</b>
        {bonus}=
      </Text>
      <Text fontSize="md">{result.newTotal}</Text>
    </>
  );
}

function buildRoundsTableColumns(
  game: GameAugmented,
  currentUser?: AuthUser | null
) {
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
      meta: {
        cellProps: () => ({
          'data-playerid': player.id,
          className:
            game.players.length > 1 && player.id === currentUser?.id
              ? 'current-user'
              : '',
        }),
      },
    });
  });

  const roundCol = columnHelper.accessor((round) => round, {
    header: 'Round',
    cell: (cell) => <RoundDescriptionCell round={cell.getValue()} />,
  });

  return [roundCol, ...playerCols];
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

function gameStatusText(game: GameAugmented) {
  if (game.endedAt) {
    return `Finished ${game.endedAt}`;
  }
  if (game.startedAt) {
    return 'In progress';
  }
  if (game.ableToStart) {
    return 'Waiting for host to start';
  }
  return 'Waiting for others to join';
}

/** Returns new array of player objects sorted for ranking (smallest to largest) */
function sortPlayersByPointsAsc(players: PlayerAugmented[]): PlayerAugmented[] {
  return [...players].sort((p1, p2) => p1.points - p2.points);
}

const tableMeta = {
  rowProps: (row: CoreRow<GameRoundAugmented>) => ({
    className: `status-${row.original.status}`,
  }),
};

export function GameScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const authCtx = useAuthContext();
  const toast = useToast();
  const finishRoundModal = useDisclosure();
  const transferOwnershipModal = useDisclosure();
  const changeNameModal = useDisclosure();
  const cardModal = useDisclosure();
  const [game, setGame] = useState<GameAugmented>();
  const [showQrCode, setShowQrCode] = useState(false);
  const [showJsonData, setShowJsonData] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerId = useRef<number>();
  const [error, setError] = useState('');
  const [gameStarting, setGameStarting] = useState(false);
  const currentCardState = useCurrentRoundCardState();

  // Poll game data from server regularly
  const pollGame = useCallback(() => {
    if (!gameId) {
      return;
    }
    getGameCached(gameId)
      .then((updatedGame) => {
        setError('');
        setGame(updatedGame);
        clearTimeout(timerId.current!);
        timerId.current = window.setTimeout(pollGame, 2_000);
      })
      .catch((err) => {
        const retryable = err instanceof ApiError && err.retryable;
        clearTimeout(timerId.current!);
        if (retryable) {
          timerId.current = window.setTimeout(pollGame, 10_000);
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

  // Start polling of game data
  useEffect(() => {
    pollGame();
    return () => clearTimeout(timerId.current!);
  }, [pollGame]);

  // Show the QR code once game data loads if game has not started.
  useEffect(() => {
    setShowQrCode(!loading && !Boolean(game?.startedAt));
  }, [loading, game?.startedAt]);

  const playersSorted = useMemo(
    () => sortPlayersByPointsAsc(game?.players || []),
    [game?.players]
  );

  const currentUser = authCtx?.user;

  const gameRounds = game?.rounds;
  const tableData = useMemo(() => gameRounds || [], [gameRounds]);
  const tableColumns = useMemo(
    () => (game ? buildRoundsTableColumns(game, currentUser) : []),
    [game, currentUser]
  );

  const currentPlayer: PlayerAugmented | null | undefined = useMemo(
    () =>
      game && currentUser && game.players.find((p) => p.id === currentUser?.id),
    [currentUser, game]
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
      {game && (
        <CurrentRoundCardModal
          game={game}
          modalState={cardModal}
          cardState={currentCardState}
        />
      )}
      {game && currentPlayer?.isHost && (
        <>
          <RecordPointsModal
            game={game}
            modalState={finishRoundModal}
            onGameUpdate={setGame}
          />
          <ChangeGameNameModal
            game={game}
            modalState={changeNameModal}
            onGameUpdate={setGame}
          />
          <TransferOwnershipModal
            game={game}
            modalState={transferOwnershipModal}
            onGameUpdate={setGame}
          />
        </>
      )}
      <VStack align="flex-start" alignItems="start" width="100%">
        {loading && <Spinner size="xl" alignSelf="center" />}

        {!loading && !game && <Heading>{gameId}</Heading>}

        {error && (
          <Alert status="error" mb={5}>
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
              <Flex
                direction="column"
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

                      <Text fontSize="sm">
                        <b>{game.players.length}</b>{' '}
                        {`player${game.players.length > 1 ? 's' : ''}`} -{' '}
                        {gameStatusText(game)}
                      </Text>

                      {game.currentRound && (
                        <Text fontSize="sm">
                          Dealer perfect cut:{' '}
                          <b>{game.dealerPerfectCutCards}</b> cards
                        </Text>
                      )}

                      <Flex
                        className="game-ctrl-buttons"
                        justifyContent="start"
                        flexWrap="wrap"
                        gap={2}
                        mt={3}
                      >
                        {!currentPlayer && (
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
                                onClick={() => finishRoundModal.onOpen()}
                                leftIcon={<SlPencil />}
                              >
                                Record Points
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
                              <>
                                <MenuItem
                                  onClick={() => changeNameModal.onOpen()}
                                >
                                  Rename Game
                                </MenuItem>
                                <MenuItem
                                  onClick={() =>
                                    transferOwnershipModal.onOpen()
                                  }
                                >
                                  Transfer Ownership
                                </MenuItem>
                              </>
                            )}

                            <MenuItem
                              onClick={() => setShowQrCode(!showQrCode)}
                            >
                              {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
                            </MenuItem>

                            <MenuItem
                              onClick={() => setShowJsonData(!showJsonData)}
                            >
                              Toggle JSON
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Flex>
                  </CardBody>
                </Card>

                <CurrentRoundCard
                  game={game}
                  state={currentCardState}
                  visibility={cardModal.isOpen ? 'hidden' : 'visible'}
                  maxWidth="310px"
                  mb={5}
                  onClick={() => cardModal.onOpen()}
                />

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
                    mb={5}
                  />

                  {(!game.hasStarted ||
                    currentPlayer?.isHost ||
                    showQrCode) && (
                    <Button
                      size="sm"
                      leftIcon={<IoQrCodeOutline />}
                      onClick={() => setShowQrCode(!showQrCode)}
                    >
                      {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
                    </Button>
                  )}
                </Flex>
              </Flex>

              <VStack
                className="content"
                justifyContent="start"
                alignContent="start"
                width={{ lg: '70%', base: 'full' }}
              >
                <Card size="sm" width="100%" mb={10}>
                  <CardBody>
                    <SimpleGrid minChildWidth="100px" spacingY={5}>
                      {playersSorted.map((player) => (
                        <Tooltip
                          key={player.id}
                          label={[
                            player.isHost ? '[Host]' : '',
                            `${player.points} points`,
                            player.isWinner ? '- First Place!' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          shouldWrapChildren
                        >
                          <Flex direction="column" alignItems="center">
                            <PlayerAvatar
                              player={player}
                              showHostBadge={true}
                              showShadow={true}
                              mb={1}
                            />
                            <Text fontSize="md" align="center">
                              {player.displayName}{' '}
                            </Text>
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
                          </Flex>
                        </Tooltip>
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
            readOnly
            fontFamily="monospace"
            value={JSON.stringify(game, null, 2)}
            rows={50}
          />
        )}
      </VStack>
    </Container>
  );
}
