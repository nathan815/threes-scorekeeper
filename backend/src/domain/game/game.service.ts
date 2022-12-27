import { User } from '../user/user.model';
import { Game } from './game.model';
import { GameRepository } from './game.repository';

export class GameService {
  constructor(private gameRepo: GameRepository) {}

  async getGames() {
    return await this.gameRepo.getAll();
  }

  async getByShortId(id: string): Promise<Game | undefined> {
    return await this.gameRepo.getByShortId(id);
  }

  async createGame({ name, owner }: { name: string; owner: User }) {
    console.log('createGame name', name)
    const game = new Game(name, owner);
    return await this.gameRepo.create(game);
  }
}
