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
  TableContainer,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { CoreRow, createColumnHelper } from '@tanstack/react-table';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconBaseProps } from 'react-icons';
import {
  IoArrowForwardSharp,
  IoCheckmark,
  IoChevronDown,
  IoEllipsisHorizontalOutline,
  IoEnter,
  IoHourglass,
  IoPersonAdd,
  IoPlay,
  IoQrCodeOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import { MdStars } from 'react-icons/md';
import QRCode from 'react-qr-code';
import { useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../api';
import { AuthUser, useAuthContext } from '../../auth/authContext';
import { CardIcon } from '../../components/CardIcon';
import { DataTable } from '../../components/DataTable';
import {
  GameAugmented,
  GameRoundAugmented,
  getGameCached,
  joinGame,
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

import { LiveTimeAgo } from 'src/components/LiveTimeAgo';
import { getDurationText } from 'src/utils/time';
import { CurrentRoundCard, useCurrentRoundCardState } from './CurrentRoundCard';
import './Game.css';
import { ChangeGameNameModal } from './modals/ChangeGameNameModal';
import { JoinGameModal } from './modals/JoinGameModal';
import { RecordPointsModal } from './modals/RecordPointsModal';
import { TransferOwnershipModal } from './modals/TransferOwnershipModal';
import { AddPlayerModal } from 'src/screens/game/modals/AddPlayerModal';

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

function GameStatusDisplay({ game }: { game: GameAugmented }) {
  let status;
  if (game.endedAt) {
    status = (
      <>
        {'Finished '} <LiveTimeAgo date={game.endedAt} /> ago
      </>
    );
  } else if (game.startedAt) {
    const dur = getDurationText({
      d1: game.startedAt,
      unitDisplay: 'short',
      minimumUnit: 'minute',
    });
    status = `In progress ${dur ? `(${dur})` : ''}`;
    status = (
      <>
        {'In progress '}(
        <LiveTimeAgo date={game.startedAt} />)
      </>
    );
  } else if (game.ableToStart) {
    status = 'Waiting for host to start';
  } else {
    status = 'Waiting for others to join';
  }
  return <>{status}</>;
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

function shouldShowTableShadow(element: HTMLDivElement): boolean {
  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const hideShadowPos = maxScrollLeft - 10;
  // console.log(maxScrollLeft, hideShadowPos);
  return hideShadowPos > 0 && element.scrollLeft <= hideShadowPos;
}

function PlayerScoresTable({
  game,
  currentUser,
}: {
  game: GameAugmented;
  currentUser?: AuthUser | null;
}) {
  const gameRounds = game?.rounds;
  const tableData = useMemo(() => gameRounds || [], [gameRounds]);
  const tableColumns = useMemo(
    () => (game ? buildRoundsTableColumns(game, currentUser) : []),
    [game, currentUser]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShadow, setShowShadow] = useState(false);

  useEffect(() => {
    // Hide shadow once we reach scroll end
    const onContainerScroll = (event) => {
      setShowShadow(shouldShowTableShadow(event.target));
    };
    const ele = containerRef?.current;
    if (ele) {
      setShowShadow(shouldShowTableShadow(ele));
      ele.addEventListener('scroll', onContainerScroll);
      return () => ele.removeEventListener('scroll', onContainerScroll);
    }
  }, []);

  return (
    <div className={`game-table-wrapper ${showShadow ? 'shadow' : ''}`}>
      <TableContainer width="full" ref={containerRef}>
        <DataTable
          columns={tableColumns}
          data={tableData}
          options={{ meta: tableMeta }}
          tableProps={{
            className: 'game-table',
            size: 'sm',
          }}
        />
      </TableContainer>
    </div>
  );
}

export function GameScreen() {
  // console.log('RENDER');
  const { gameId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const authCtx = useAuthContext();
  const toast = useToast();

  // Modal states
  const joinGameModal = useDisclosure({
    onClose: useCallback(
      () => setSearchParams({}, { replace: true }),
      [setSearchParams]
    ),
  });
  const finishRoundModal = useDisclosure();
  const transferOwnershipModal = useDisclosure();
  const changeNameModal = useDisclosure();
  const cardModal = useDisclosure();
  const addPlayerModal = useDisclosure();

  const [game, setGame] = useState<GameAugmented>();
  const [showQrCode, setShowQrCode] = useState(false);
  const [showJsonData, setShowJsonData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameStarting, setGameStarting] = useState(false);
  const [gameJoining, setGameJoining] = useState(false);
  const timerId = useRef<number>();
  const currentCardState = useCurrentRoundCardState();

  const [joinParams, setJoinParams] = useState({
    join: searchParams.get('join') === 'true',
    confirm: searchParams.get('confirm') === 'true',
    actedOn: false,
  });

  const currentUser = authCtx?.user;

  const playersSorted = useMemo(
    () => sortPlayersByPointsAsc(game?.players || []),
    [game?.players]
  );
  const currentPlayer = useMemo(
    () =>
      game && currentUser && game.players.find((p) => p.id === currentUser?.id),
    [currentUser, game]
  );

  // Poll game data from server periodically
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

  const onJoinGame = useCallback(async () => {
    if (!game) {
      return;
    }
    setGameJoining(true);
    try {
      const updatedGame = await joinGame(game.shortId);
      setGame(updatedGame);
      if (!toast.isActive('joined')) {
        toast({
          id: 'joined',
          description: 'You have joined this game',
          status: 'success',
          position: 'top',
        });
      }
      return updatedGame;
    } catch (err) {
      toast({
        description: `${err}`,
        position: 'top',
        status: 'error',
      });
    } finally {
      setGameJoining(false);
    }
  }, [game, toast]);

  useEffect(() => {
    // Start polling of game data
    pollGame();
    return () => clearTimeout(timerId.current!);
  }, [pollGame]);

  useEffect(() => {
    // Show the QR code once game data loads if game has not started.
    setShowQrCode(!loading && !Boolean(game?.startedAt));
  }, [loading, game?.startedAt]);

  const openJoinModal = joinGameModal.onOpen;
  useEffect(() => {
    // Open the join modal if URL query params are present
    console.log('join modal effect');
    if (loading || joinParams.actedOn || currentPlayer) {
      return;
    }

    // If ?join=true
    if (joinParams.join) {
      // If ?confirm=true, OR needs auth, OR game has already started
      if (joinParams.confirm || !currentUser || game?.hasStarted) {
        openJoinModal();
      } else {
        // TODO loading state here to disable Join button
        onJoinGame();
      }
    }

    setJoinParams((prev) => ({ ...prev, actedOn: true }));
  }, [
    loading,
    joinParams,
    currentUser,
    currentPlayer,
    game?.hasStarted,
    onJoinGame,
    openJoinModal,
  ]);

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
        <>
          <JoinGameModal
            game={game}
            modalState={joinGameModal}
            onJoinGame={onJoinGame}
          />
          <CurrentRoundCardModal
            game={game}
            modalState={cardModal}
            cardState={currentCardState}
          />
        </>
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
          <AddPlayerModal
            game={game}
            modalState={addPlayerModal}
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
                        {/* <Heading size="md">Game:</Heading> */}
                        {/* <BsChevronDoubleRight /> */}
                        <Heading size="md" fontWeight="normal">
                          <b>Game:</b> {game.name}
                        </Heading>
                      </HStack>

                      <Text fontSize="sm">
                        <b>{game.players.length}</b>{' '}
                        {`player${game.players.length > 1 ? 's' : ''}`} -{' '}
                        <GameStatusDisplay game={game} />
                      </Text>

                      {game.currentRound && (
                        <Text fontSize="sm">
                          Dealer perfect cut:{' '}
                          <b>{game.dealerPerfectCutCards}</b> cards
                        </Text>
                      )}

                      {currentPlayer?.isHost && (
                        <Text fontSize="sm">You are the game host</Text>
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
                              onClick={() => joinGameModal.onOpen()}
                              colorScheme="blue"
                              leftIcon={<IoEnter />}
                              disabled={gameJoining}
                              isLoading={gameJoining}
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
                                // colorScheme="blue"
                                leftIcon={<IoPersonAdd />}
                                onClick={addPlayerModal.onOpen}
                              >
                                Add
                              </Button>
                            )}

                            {game.hasStarted && !game.endedAt && (
                              <Button
                                colorScheme="blue"
                                onClick={() => finishRoundModal.onOpen()}
                                leftIcon={<IoArrowForwardSharp />}
                              >
                                Record Points
                              </Button>
                            )}

                            {game.endedAt && (
                              <Button colorScheme="blue">Start New Game</Button>
                            )}
                          </>
                        )}

                        <Menu>
                          <MenuButton as={Button} rightIcon={<IoChevronDown />}>
                            <IoSettingsOutline />
                          </MenuButton>
                          <MenuList>
                            {currentPlayer?.isHost && (
                              <>
                                <MenuItem
                                  onClick={() => changeNameModal.onOpen()}
                                >
                                  Edit Name
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
                  outerContainerProps={{
                    visibility: cardModal.isOpen ? 'hidden' : 'visible',
                    mb: 5,
                  }}
                  cardContainerProps={{
                    maxWidth: '310px',
                    onClick: () => cardModal.onOpen(),
                  }}
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

                <PlayerScoresTable game={game} currentUser={currentUser} />
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
