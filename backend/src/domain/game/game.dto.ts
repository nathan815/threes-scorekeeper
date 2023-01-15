import { UserPublicDto, userToDto } from '../user/user.dto';
import {
  Game,
  GameRound,
  GameStage,
  Player,
  PlayerResultMap,
} from './game.model';

export interface GameRoundDto {
  cardRank: number;
  isFinished: boolean;
  startedAt: Date;
  endedAt?: Date;
  playerResults: PlayerResultMap;
}

export interface GameDto {
  id: string;
  name: string;
  shortId: string;
  stage: GameStage;
  owner: UserPublicDto;
  players: Player[];
  currentWinnerIds: string[];
  totalPointsByPlayer: { [userId: string]: number };
  startedAt?: Date;
  endedAt?: Date;
  currentRound: number | null;
  rounds: GameRoundDto[];
}

function gameRoundToDto({
  startedAt,
  endedAt,
  cardRank,
  playerResults,
  isFinished,
}: GameRound): GameRoundDto {
  return {
    cardRank: cardRank.number,
    isFinished,
    startedAt,
    endedAt,
    playerResults,
  };
}

export function gameToDto(game: Game): GameDto {
  const {
    id,
    name,
    shortId,
    owner,
    players,
    stage,
    currentRound,
    rounds,
    currentWinners,
    startedAt,
    endedAt,
  } = game;
  return {
    id,
    name,
    shortId,
    stage,
    owner: userToDto(owner!),
    players,
    currentRound: currentRound?.cardRank.number || null,
    rounds: rounds.map(gameRoundToDto),
    totalPointsByPlayer: game.totalPointsByPlayer(),
    currentWinnerIds: currentWinners.map((p) => p.id),
    startedAt,
    endedAt,
  };
}
