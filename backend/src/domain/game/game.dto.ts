import { UserPublicDto, userToDto } from '../user/user.dto';
import { Game, GameRound, GameStage } from './game.model';

export interface GameDto {
  id: string;
  name: string;
  shortId: string;
  owner: UserPublicDto;
  players: UserPublicDto[];
  stage: GameStage;
  currentRound: number | null;
  rounds: GameRound[];
  totalPointsByPlayer: { [userId: string]: number };
  winningPlayerId?: string;
}

export function gameToDto({
  id,
  name,
  shortId,
  owner,
  players,
  stage,
  currentRound,
  rounds,
  totalPointsByPlayer,
  winningPlayer,
}: Game): GameDto {
  const playerDtos = players.map(userToDto);
  return {
    id,
    name,
    shortId,
    stage,
    owner: userToDto(owner!),
    players: playerDtos,
    currentRound: currentRound?.cardRank.number || null,
    rounds,
    totalPointsByPlayer: totalPointsByPlayer,
    winningPlayerId: winningPlayer?.id,
  };
}
