import { StatusCodes } from 'http-status-codes';
import Router from 'express-promise-router';
import * as v from 'express-validator';
import { Request, Response, NextFunction } from 'express';

import { gameToDto } from '../domain/game/game.dto';
import { userToDto, userToPrivateDto } from '../domain/user/user.dto';
import {
  requiresNoAuth,
  checkRequestValidation,
  requiresAuth,
} from './middleware';
import {
  GameError,
  NonOwnerCannotStartGameError,
} from '../domain/game/game.model';

export const router = Router();

router.get('/', (req, res) => {
  res.send('Threes');
});

router.post(
  '/auth/register/guest',
  requiresNoAuth,
  v.body('displayName').isString().notEmpty(),
  checkRequestValidation,
  async (req, res) => {
    const user = await req.di.userService.createGuestUser({
      displayName: req.body.displayName,
    });
    req.session.userId = user.id;
    console.log(req.session.userId, req.session);
    return res.status(StatusCodes.CREATED).json({
      guestSecret: user.guestSecret,
      user: userToPrivateDto(user),
    });
  }
);

router.post(
  '/auth/login/guest',
  requiresNoAuth,
  v.body('userId').isString().notEmpty(),
  v.body('secret').isString().notEmpty(),
  checkRequestValidation,
  async (req, res) => {
    const result = await req.di.userService.checkGuestUserSecret(
      req.body.userId,
      req.body.secret
    );
    if (result === null) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        errorMessage: 'User not found',
      });
    }
    if (result === false) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        errorMessage: 'Auth failure',
      });
    }
    const user = result;
    req.session.userId = user.id;
    return res.status(StatusCodes.OK).json({
      user: userToPrivateDto(user),
    });
  }
);

router.get('/users', async (req, res) => {
  const users = await req.di.userService.getUsers();
  console.log('users', users);
  return res.json(users.map(userToDto));
});

router.get('/games', async (req, res) => {
  const games = await req.di.gameService.getGames();
  console.log('games', games);
  return res.json(games.map(gameToDto));
});

router.get(
  '/games/:id',
  v.param('id').isString(),
  checkRequestValidation,
  async (req, res) => {
    const game = await req.di.gameService.getByShortId(req.params.id);
    if (!game) {
      return res.status(StatusCodes.NOT_FOUND).send({
        errorMessage: 'Game not found',
      });
    }
    return res.json(gameToDto(game));
  }
);

router.post(
  '/games',
  requiresAuth,
  v.body('name').isString(),
  checkRequestValidation,
  async (req, res) => {
    const game = await req.di.gameService.createGame({
      name: req.body.name,
      owner: req.user!,
    });
    res.json(gameToDto(game));
  }
);

router.post(
  '/games/:id/join',
  requiresAuth,
  checkRequestValidation,
  async (req, res) => {
    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }
    try {
      game.addPlayer(req.user!);
    } catch (err) {
      if (err instanceof GameError) {
        return res.status(StatusCodes.CONFLICT).send({
          errorMessage: `Unable to join game: ${err.message}`,
        });
      }
      throw err;
    }
    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

router.post(
  '/games/:id/start',
  requiresAuth,
  checkRequestValidation,
  async (req, res) => {
    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }
    try {
      game.start(req.user!);
    } catch (err) {
      if (err instanceof NonOwnerCannotStartGameError) {
        return res.status(StatusCodes.FORBIDDEN).send({
          errorMessage: err.message,
        });
      }
      if (err instanceof GameError) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errorMessage: err.message,
        });
      }
      throw err;
    }
    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

router.put(
  '/games/:id/rounds/:round/playerResult/:userId',
  requiresAuth,
  v.oneOf(
    [
      v.param('round').isInt().withMessage('not an integer').toInt(),
      v.param('round').equals('current').withMessage('not equal to current'),
    ],
    "round must be 'current' or a previous round number"
  ),
  v.param('userId').isMongoId(),
  v.body('points').isInt().toInt(),
  v.body('perfectDeckCut').isBoolean({ strict: true }),
  checkRequestValidation,
  async (req, res) => {
    const { round, userId } = req.params;
    const { points, perfectDeckCut } = req.body;

    const subjectUser = await req.di.userService.getUser(userId);
    if (!subjectUser) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        errorMessage: 'Provided userId does not exist',
      });
    }

    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }

    try {
      const roundNumber = round === 'current' ? undefined : parseInt(round);
      game.recordPlayerRoundResult(
        subjectUser,
        points,
        perfectDeckCut,
        roundNumber
      );
    } catch (err) {
      if (err instanceof GameError) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errorMessage: err.message,
          details: { ...err },
        });
      }
      throw err;
    }

    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

router.post(
  '/games/:id/rounds/current/end',
  requiresAuth,
  checkRequestValidation,
  async (req, res) => {
    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }
    try {
      game.nextRound();
    } catch (err) {
      if (err instanceof GameError) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errorMessage: err.message,
          details: { ...err },
        });
      }
      throw err;
    }
    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

async function getGameOrSendFailure(
  req: Request,
  res: Response,
  idFn = (req: Request) => req.params.id
) {
  const game = await req.di.gameService.getByShortId(idFn(req));
  if (!game) {
    res.status(StatusCodes.NOT_FOUND).send({
      errorMessage: 'Game not found',
    });
    return false;
  }
  return game;
}
