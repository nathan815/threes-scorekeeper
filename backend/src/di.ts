import { NextFunction, Request, Response } from 'express';
import { GameRepositoryMongo } from './db/game.db';
import { UserRepositoryMongo } from './db/user.db';
import { GameRepository } from './domain/game/game.repository';
import { GameService } from './domain/game/game.service';
import { UserRepository } from './domain/user/user.repository';
import { UserService } from './domain/user/user.service';


export type DIContainer = {
  repositories: {
    game: GameRepository;
    user: UserRepository;
  };
  gameService: GameService;
  userService: UserService;
};


export function createDIContainer(): DIContainer {
  const repositories = {
    game: new GameRepositoryMongo(),
    user: new UserRepositoryMongo(),
  };
  return {
    repositories,
    gameService: new GameService(repositories.game),
    userService: new UserService(repositories.user),
  };
}

const DI = createDIContainer();

export function injectDIMiddleware(req: Request, res: Response, next: NextFunction) {
  req.di = DI;
  next();
}
