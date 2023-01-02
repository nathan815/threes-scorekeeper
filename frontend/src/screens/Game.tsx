import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  AvatarProps,
  Box,
  Center,
  Heading,
  HStack,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  Tooltip,
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
import { IoCheckmark, IoHourglass } from 'react-icons/io5';
import {
  GiCard3Diamonds,
  GiCard4Diamonds,
  GiCard5Diamonds,
  GiCard6Diamonds,
  GiCard7Diamonds,
  GiCard8Diamonds,
  GiCard9Diamonds,
  GiCard10Diamonds,
  GiCardJackDiamonds,
  GiCardQueenDiamonds,
  GiCardKingDiamonds,
} from 'react-icons/gi';
import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
import { api, Game, GameRound, Player } from '../api';
import { DataTable } from '../components/DataTable';
import { LogoHeader } from '../components/LogoHeader';

interface GameRoundAugmented extends GameRound {
  status: 'finished' | 'inProgress' | 'notStarted';
}

interface GameAugmented extends Game {
  rounds: GameRoundAugmented[];
}

const START_ROUND = 3;
const END_ROUND = 13;

/**
 * Augments game object with additional info useful for the UI.
 */
function augmentGame(game: Game): GameAugmented {
  const augmentedRounds: GameRoundAugmented[] = game.rounds.map((round) => {
    return {
      ...round,
      status: round.isFinished ? 'finished' : 'inProgress',
    };
  });

  // Add rounds not yet started
  for (
    let i = Math.max(START_ROUND, augmentedRounds.length + 1);
    i <= END_ROUND;
    i++
  ) {
    augmentedRounds.push({
      cardRank: i,
      status: 'notStarted',
      isFinished: false,
      playerResults: {},
    });
  }

  return { ...game, rounds: augmentedRounds };
}

function GameRoundCard({ round }: { round: GameRoundAugmented }) {
  const CardIcon = {
    3: GiCard3Diamonds,
    4: GiCard4Diamonds,
    5: GiCard5Diamonds,
    6: GiCard6Diamonds,
    7: GiCard7Diamonds,
    8: GiCard8Diamonds,
    9: GiCard9Diamonds,
    10: GiCard10Diamonds,
    11: GiCardJackDiamonds,
    12: GiCardQueenDiamonds,
    13: GiCardKingDiamonds,
  }[round.cardRank];
  if (!CardIcon) {
    return null;
  }
  return <CardIcon size={35} />;
}

function GameRoundCell({ round }: { round: GameRoundAugmented }) {
  const statusDisplay = {
    finished: {
      label: 'Finished',
      icon: () => <IoCheckmark />,
    },
    inProgress: {
      label: 'In Progress',
      icon: () => <IoHourglass />,
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
        <GameRoundCard round={round} />
        <Text>{name ? name.substring(0, 1) : round.cardRank}</Text>
        {statusDisplay.icon && statusDisplay.icon()}
      </HStack>
    </Tooltip>
  );
}

interface PlayerAvatarProps extends AvatarProps {
  player: Player;
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

function buildRoundsTableColumns(game: GameAugmented) {
  const columnHelper = createColumnHelper<GameRoundAugmented>();
  const playerCols = game.players.map((player) => {
    return columnHelper.accessor((round) => round.playerResults[player.id], {
      id: player.id,
      header: () => (
        <HStack spacing={2}>
          <PlayerAvatar player={player} size="xs" />
          <Text>{player.displayName}</Text>
        </HStack>
      ),
      cell: (cell) => {
        const value = cell.getValue();
        const totalPoints = value
          ? value.cardPoints + (value.cutDeckPerfect ? -20 : 0)
          : null;
        return <Text>{totalPoints === null ? '-' : totalPoints}</Text>;
      },
      sortingFn: (a, b, _colId) => {
        const aVal = a.original.playerResults[player.id]?.cardPoints || 0;
        const bVal = b.original.playerResults[player.id]?.cardPoints || 0;
        return aVal - bVal;
      },
    });
  });

  return [
    columnHelper.accessor((row) => row, {
      header: 'Round',
      cell: (col) => <GameRoundCell round={col.getValue()} />,
    }),
    ...playerCols,
  ];
}

let gameCache: GameAugmented | null = null;
async function fetchGame(id): Promise<GameAugmented> {
  const game = augmentGame(await api.getGame(id));
  if (gameCache != null && JSON.stringify(game) === JSON.stringify(gameCache)) {
    return gameCache;
  }
  gameCache = game;
  return game;
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

export function GameScreen() {
  const { gameId } = useParams();
  const toast = useToast();
  const [game, setGame] = useState<GameAugmented>(null);
  const [loading, setLoading] = useState(true);
  const timerId = useRef<number | null>(null);
  const [error, setError] = useState('');

  const getGame = useCallback(() => {
    fetchGame(gameId)
      .then((updatedGame) => {
        setError('');
        setGame(updatedGame);
        clearTimeout(timerId.current!);
        timerId.current = window.setTimeout(getGame, 2_000);
      })
      .catch((err) => {
        clearTimeout(timerId.current!);
        timerId.current = window.setTimeout(getGame, 10_000);
        setError(`${err}`);
        if (!toast.isActive('game-load-error')) {
          toast({
            id: 'game-load-error',
            title: 'Failed to get game data',
            description: `${err} Retrying in 10s...`,
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

  const tableData = useMemo(() => (game ? game.rounds : []), [game]);
  const tableColumns = useMemo(
    () => (game ? buildRoundsTableColumns(game) : []),
    [game]
  );
  return (
    <VStack align="flex-start" alignItems="start" mt={15} width="100%">
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
            <VStack alignItems="start">
              <SimpleGrid minChildWidth="50px" width="100%">
                {/* <Wrap align="start" spacing={5}> */}
                {game.players.map((player) => (
                  <Box
                    key={player.id}
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                  >
                    <PlayerAvatar player={player} mb={1} />
                    <Text fontSize="sm" align="center">
                      {player.displayName}
                    </Text>
                  </Box>
                ))}
                {/* </Wrap> */}
              </SimpleGrid>
              <GameQRCode id={gameId} />
            </VStack>
            <Spacer />
            <VStack justifyContent="start" alignContent="start" width="100%">
              <DataTable columns={tableColumns} data={tableData} />
              {/* <Box>
              <code>{JSON.stringify(game)}</code>
            </Box> */}
            </VStack>
          </Stack>
        </>
      )}
    </VStack>
  );
}
