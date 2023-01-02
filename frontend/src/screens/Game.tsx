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
  ButtonGroup,
  Card,
  CardBody,
  Center,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconBaseProps } from 'react-icons';
import {
  IoCheckmark,
  IoEllipsisHorizontalOutline,
  IoHourglass,
  IoTrophySharp,
} from 'react-icons/io5';
import { MdStars } from 'react-icons/md';
import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
import { ApiError, Player } from '../api';
import { ALL_SUITS, CardIcon, CardSuit } from '../components/CardIcon';
import { DataTable } from '../components/DataTable';
import { LogoHeader } from '../components/LogoHeader';
import {
  GameAugmented,
  GameRoundAugmented,
  getGameCached,
  PlayerAugmented,
  PlayerResultAugmented,
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

function RoundDescriptionCell({ round }: { round: GameRoundAugmented }) {
  const statusDisplay = {
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
  }[round.status];
  const name = {
    11: 'Jack',
    12: 'Queen',
    13: 'King',
  }[round.cardRank];
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
      <Text color="grey" fontSize="xs" fontFamily="monospace">
        {result.previousTotal}+{result.cardPoints}
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

function GameQRCode({ id }) {
  const qrCodeUrl = `${window.location.origin}/join/${id}`;
  return (
    <Box padding={5} bg="white" borderRadius={5}>
      <QRCode value={qrCodeUrl} />
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

  useEffect(() => {
    const changeSuit = () => {
      setSuitIdx((cur) => (cur + 1) % ALL_SUITS.length);
    };
    const timerId = setInterval(changeSuit, 3000);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <>
      {ALL_SUITS.map((suit, idx) => (
        <Box
          key={idx}
          display={idx === suitIdx ? 'block' : 'none'}
          style={{ marginTop: 0 }}
        >
          <GameRoundCard
            round={game.currentRound}
            cardSuit={suit}
            size="100%"
          />
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

export function GameScreen() {
  const { gameId } = useParams();
  const toast = useToast();
  const [game, setGame] = useState<GameAugmented>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showJsonData, setShowJsonData] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerId = useRef<number | null>(null);
  const [error, setError] = useState('');

  const getGame = useCallback(() => {
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
    setShowQrCode(game && !game.startedAt);
  }, [game]);

  const gameRounds = game?.rounds;
  const tableData = useMemo(() => gameRounds || [], [gameRounds]);
  const tableColumns = useMemo(
    () => (game ? buildRoundsTableColumns(game) : []),
    [game]
  );
  return (
    <VStack align="flex-start" alignItems="start" width="100%">
      <HStack>
        <LogoHeader width={150} mr={5} />
        <Heading>{game ? game.name : ''}</Heading>
      </HStack>

      {loading && (
        <Center>
          <Spinner size="xl" />
        </Center>
      )}

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
            <VStack justifyContent="start" alignItems="center" mr={5}>
              <CurrentRoundCard game={game} />

              <Box mt={0}>
                <Box display={showQrCode ? 'visible' : 'none'}>
                  <GameQRCode id={gameId} />
                </Box>

                <ButtonGroup mt={5}>
                  <Button onClick={() => setShowQrCode(!showQrCode)}>
                    {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
                  </Button>

                  <Button onClick={() => setShowJsonData(!showJsonData)}>
                    [DEV] JSON
                  </Button>
                </ButtonGroup>
              </Box>
            </VStack>

            <Spacer />

            <VStack justifyContent="start" alignContent="start" width="100%">
              <Card size="sm" width="100%" mb={10}>
                <CardBody>
                  <SimpleGrid minChildWidth="50px">
                    {game.players.map((player) => (
                      <Box
                        key={player.id}
                        display="flex"
                        alignItems="center"
                        flexDirection="column"
                      >
                        <PlayerAvatar player={player} mb={1} />
                        <Text fontSize="sm" align="center">
                          {player.displayName}{' '}
                          {player.isHost ? (
                            <Text as="span" color="grey">
                              (host)
                            </Text>
                          ) : (
                            ''
                          )}
                        </Text>
                        <HStack
                          spacing={1}
                          alignContent="center"
                          alignItems="center"
                        >
                          <Badge>{player.points}</Badge>{' '}
                          {player.isWinner && <Tooltip label="First Place"><MdStars color="gold" /></Tooltip>}
                        </HStack>
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
  );
}
