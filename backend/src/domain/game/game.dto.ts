import { UserPublicDto, userToDto } from '../user/user.dto';
import { Game, GameStage } from './game.model';

export interface GameDto {
  id: string;
  name: string;
  shortId: string;
  owner?: UserPublicDto;
  players: UserPublicDto[];
  stage: GameStage;
}

export function gameToDto({
  id,
  name,
  shortId,
  owner,
  players,
  stage,
}: Game): GameDto {
  const playerDtos = players.map(userToDto);
  return { id, name, shortId, stage, owner: owner && userToDto(owner), players: playerDtos };
}
