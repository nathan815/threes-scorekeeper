import { UserPublicDto, userToDto } from '../user/user.dto';
import { CardRank } from './cards';
import { Game, GameRound, GameStage, PlayerResultMap } from './game.model';

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
  owner: UserPublicDto;
  players: UserPublicDto[];
  stage: GameStage;
  currentRound: number | null;
  rounds: GameRoundDto[];
  totalPointsByPlayer: { [userId: string]: number };
  currentWinnerIds: string[];
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
  } = game;
  return {
    id,
    name,
    shortId,
    stage,
    owner: userToDto(owner!),
    players: players.map(userToDto),
    currentRound: currentRound?.cardRank.number || null,
    rounds: rounds.map(gameRoundToDto),
    totalPointsByPlayer: game.totalPointsByPlayer(),
    currentWinnerIds: currentWinners.map((p) => p.id),
  };
}
