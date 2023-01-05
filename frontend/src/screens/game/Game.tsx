import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  AvatarBadge,
  AvatarProps,
  Badge,
  Box,
  BoxProps,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  UseDisclosureProps,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { CoreRow, createColumnHelper } from '@tanstack/react-table';
import { debounce, mapValues } from 'lodash';
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
import { ApiError, PlayerResultInput } from '../../api';
import { AuthUser, useAuthContext } from '../../auth/authContext';
import { CardIcon } from '../../components/CardIcon';
import { DataTable } from '../../components/DataTable';
import { PlayingCard } from '../../components/PlayingCard';
import {
  completeCurrentRound,
  GameAugmented,
  GameRoundAugmented,
  getGameCached,
  PlayerAugmented,
  PlayerResultAugmented,
  recordPlayerResults,
  startGame,
  updateGame,
} from '../../services/game';
import {
  ALL_SUITS,
  cardRankName,
  CardRankNumber,
  cardRankShortName,
  CardSuit,
} from '../../utils/card';
import { convertDisclosureProps } from '../../utils/disclosure';
import { useWindowResizeCallback } from '../../utils/hooks/useWindowResizeCallback';

import './Game.css';

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

function roundRankName(
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
      label={`${roundRankName(round)} - ${statusDisplay.label}`}
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

type CurrentRoundCardState = { suitIdx: number };
function useCurrentRoundCardState(): CurrentRoundCardState {
  const [suitIdx, setSuitIdx] = useState(0);
  useEffect(() => {
    const changeSuit = () => {
      if (document.hasFocus()) {
        setSuitIdx((cur) => (cur + 1) % ALL_SUITS.length);
      }
    };
    const timerId = setInterval(changeSuit, 3000);
    return () => clearTimeout(timerId);
  }, []);
  return { suitIdx };
}

function CurrentRoundCard({
  game,
  state,
  className,
  ...boxProps
}: { game: GameAugmented; state: CurrentRoundCardState } & BoxProps) {
  const cardDiv = useRef<HTMLDivElement>(null);
  const round = game?.currentRoundObj;
  const [height, setHeight] = useState(boxProps.height || 0);

  const setDivHeight = useCallback(() => {
    if (cardDiv?.current?.offsetHeight) {
      setHeight(cardDiv?.current?.offsetHeight);
    }
  }, []);

  useWindowResizeCallback(setDivHeight);
  useEffect(setDivHeight, [setDivHeight, cardDiv?.current?.offsetHeight]);

  if (!round) {
    return null;
  }

  return (
    <>
      <Tag size="lg" mb={3}>
        {`${roundRankName(round, true)}`} are wild
      </Tag>
      <Box
        className={'current-card-container ' + (className || '')}
        {...boxProps}
        height={`${height}px`}
        background="white"
        borderRadius={15}
      >
        {ALL_SUITS.map((suit, idx) => (
          <Box
            key={idx}
            className={`current-card ${idx === state.suitIdx ? 'active' : ''}`}
            ref={cardDiv}
          >
            <PlayingCard suit={suit} rank={round.cardRank as CardRankNumber} />
          </Box>
        ))}
      </Box>
    </>
  );
}

function calculateRoundCardModalWidth() {
  const EXTRA_VERT_SPACE = 150;
  const MIN_HEIGHT = 350;
  const ASPECT_RATIO = 0.7;
  const height = Math.max(MIN_HEIGHT, window.innerHeight - EXTRA_VERT_SPACE);
  const width = height * ASPECT_RATIO;
  return Math.min(window.innerWidth - 50, width);
}

function CurrentRoundCardModal({
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
              width={`${width}px`}
              height="auto"
              mb={5}
              className="no-shadow"
            />
            <Tag size="lg" textAlign="center">
              Dealer perfect cut: {game.dealerPerfectCutCards} cards
            </Tag>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
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

function TransferOwnershipModal(props: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  onGameUpdate: (game: GameAugmented) => void;
}) {
  const { game, modalState, onGameUpdate } = props;
  const toast = useToast();
  const modal = convertDisclosureProps(modalState);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (modal.isOpen) {
      setSelectedOwner('');
      setConfirmed(false);
    }
  }, [modal.isOpen]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      onGameUpdate(await updateGame(game.shortId, { ownerId: selectedOwner }));
      toast({
        description: 'Game ownership transferred',
        status: 'success',
        position: 'top',
      });
    } catch (err) {
      toast({
        description: 'Error transferring ownership',
        status: 'error',
        position: 'top',
      });
      modal.onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal {...modal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Transfer Ownership
          <ModalCloseButton />
        </ModalHeader>
        <form onSubmit={onSubmit}>
          <ModalBody>
            <FormControl>
              <Select
                placeholder="Select new host..."
                aria-label="Select new host to transfer ownership to"
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
              >
                {game?.players
                  .filter((p) => p.id !== game.owner.id)
                  .map((player) => (
                    <option value={player.id} key={player.id}>
                      {player.displayName}
                    </option>
                  ))}
              </Select>
            </FormControl>
            <FormControl mt={5}>
              <Checkbox
                isChecked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              >
                <Text>
                  I understand I will lose all host capabilities after clicking
                  on "Transfer" below.
                </Text>
              </Checkbox>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button type="button" onClick={modal.onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="red"
                disabled={!confirmed || !selectedOwner || saving}
                isLoading={saving}
              >
                Transfer
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function ChangeGameNameModal(props: {
  game: GameAugmented;
  modalState: UseDisclosureProps;
  onGameUpdate: (game: GameAugmented) => void;
}) {
  const { game, modalState, onGameUpdate } = props;
  const toast = useToast();
  const modal = convertDisclosureProps(modalState);
  const [name, setName] = useState(game.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (modal.isOpen) {
      setName(game.name);
    }
  }, [modal.isOpen, game.name]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateGame(game.shortId, { name: name });
      if (updated) {
        onGameUpdate(updated);
      }
      toast({
        description: 'Saved changes',
        status: 'success',
        position: 'top',
        duration: 2000,
      });
      modal.onClose();
    } catch (error) {
      toast({ description: `${error}`, position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal {...modal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Name
          <ModalCloseButton />
        </ModalHeader>
        <form onSubmit={onSubmit}>
          <ModalBody>
            <FormControl>
              <Input
                placeholder="Select new host..."
                aria-label="Select new host to transfer ownership to"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={true}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button type="button" onClick={modal.onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={saving}>
                Save
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
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
      {game && (
        <>
          <FinishRoundModal
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
          <CurrentRoundCardModal
            game={game}
            modalState={cardModal}
            cardState={currentCardState}
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
                          Dealer must cut <b>{game.dealerPerfectCutCards}</b>{' '}
                          cards from deck for -20pts
                        </Text>
                      )}

                      <Flex
                        className="game-ctrl-buttons"
                        justifyContent="start"
                        flexWrap="wrap"
                        gap={2}
                        mt={3}
                      >
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
