import { Game } from './game.model';

export interface GameRepository {
  getAll(): Promise<Game[]>;

  getByShortId(shortId: string): Promise<Game | undefined>;

  create(game: Game): Promise<Game>;

  update(game: Game): Promise<Game>;
}
