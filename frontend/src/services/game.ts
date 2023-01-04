import {
  api,
  Game,
  GameRound,
  Player,
  PlayerResult,
  PlayerResultInput,
  UpdateGameChanges,
} from '../api';
import { sleep } from '../utils/general';

const START_ROUND = 3;
const END_ROUND = 13;

export interface PlayerAugmented extends Player {
  isHost: boolean;
  isWinner: boolean;
  points: number;
}

export interface PlayerResultAugmented extends PlayerResult {
  newTotal: number;
  previousTotal: number;
  cardPoints: number;
  netPoints: number;
  bonusPoints: number;
}

export interface GameRoundAugmented extends GameRound {
  status: 'finished' | 'inProgress' | 'notStarted';
  playerResults: { [id: string]: PlayerResultAugmented };
}

export interface GameAugmented extends Game {
  rounds: GameRoundAugmented[];
  currentRoundObj?: GameRoundAugmented | null;
  players: PlayerAugmented[];
  hasStarted: boolean;
  ableToStart: boolean;
}

/**
 * Fetches game from API. If data is unchanged, the exact same object reference is returned as previous.
 * @param id Short game ID ("join code")
 */
export async function getGameCached(id: string): Promise<GameAugmented> {
  return augmentAndCacheGame(await api.getGame(id));
}

export async function startGame(id: string): Promise<GameAugmented> {
  return augmentAndCacheGame(await api.startGame(id));
}

export async function joinGame(id: string): Promise<GameAugmented> {
  return augmentAndCacheGame(await api.joinGame(id));
}

export async function updateGame(
  id: string,
  updates: Omit<UpdateGameChanges, 'id'>
): Promise<GameAugmented> {
  return augmentAndCacheGame(await api.updateGame({ id, ...updates }));
}

export async function completeCurrentRound(id: string): Promise<GameAugmented> {
  return augmentAndCacheGame(await api.completeCurrentRound(id));
}

export async function recordPlayerResults(
  id: string,
  results: PlayerResultInput
): Promise<GameAugmented> {
  return augmentAndCacheGame(await api.recordPlayerResults(id, results));
}

/**
 * Augments a game object from API with additional computed details.
 */
function augmentGame(game: Game): GameAugmented {
  const runningTotals: { [id: string]: number } = {};
  const augmentedRounds: GameRoundAugmented[] = game.rounds.map((round) => {
    const playerResults: { [id: string]: PlayerResultAugmented } = {};

    for (const [id, result] of Object.entries(round.playerResults)) {
      const bonusPoints = parseInt(result.perfectCutBonus as string) || 0;
      const netPoints = (result.cardPoints || 0) + bonusPoints;
      const prevTotal = runningTotals[id] || 0;
      runningTotals[id] = prevTotal + netPoints;
      playerResults[id] = {
        ...result,
        cardPoints: result.cardPoints,
        bonusPoints: bonusPoints,
        netPoints: netPoints,
        previousTotal: prevTotal,
        newTotal: runningTotals[id],
      };
    }

    return {
      ...round,
      status: round.isFinished ? 'finished' : 'inProgress',
      playerResults: playerResults,
    };
  });

  const currentRound =
    augmentedRounds.length > 0
      ? augmentedRounds[augmentedRounds.length - 1]
      : null;

  // Add rounds not yet started
  for (
    let i = Math.max(START_ROUND, (currentRound?.cardRank || 0) + 1);
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

  const augmentedPlayers = game.players.map((player) => {
    return {
      ...player,
      points: game.totalPointsByPlayer[player.id] || 0,
      isWinner: game.currentWinnerIds.includes(player.id),
      isHost: game.owner.id === player.id,
    };
  });

  return {
    ...game,
    currentRoundObj: currentRound,
    rounds: augmentedRounds,
    players: augmentedPlayers,
    hasStarted: Boolean(game.startedAt),
    ableToStart: augmentedPlayers.length > 1,
  };
}

let gameCache: { [id: string]: GameAugmented } = {};

function augmentAndCacheGame(game: Game): GameAugmented {
  const augmented = augmentGame(game);
  if (
    gameCache[game.shortId] &&
    JSON.stringify(augmented) === JSON.stringify(gameCache[game.shortId])
  ) {
    return gameCache[game.shortId];
  }
  console.log('CACHE MISS');
  gameCache[game.shortId] = augmented;
  return augmented;
}
