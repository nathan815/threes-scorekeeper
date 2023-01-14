import { Request, Response } from 'express';
import Router from 'express-promise-router';
import * as v from 'express-validator';
import { StatusCodes } from 'http-status-codes';

import { gameToDto } from '../domain/game/game.dto';
import {
  GameError,
  NonOwnerCannotStartGameError,
} from '../domain/game/game.model';
import { PseudoUser } from '../domain/user/user.model';
import { checkRequestValidation, requiresAuth } from './middleware';
import { validateDisplayName } from './validators';

export const router = Router();

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
  v
    .body('name')
    .trim()
    .isString()
    .isLength({ min: 5 })
    .withMessage('must be at least 5 chars'),
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
      game.addUserPlayer(req.user!);
    } catch (err) {
      if (err instanceof GameError) {
        return res.status(StatusCodes.CONFLICT).send({
          errorMessage: `Unable to join game: ${err.message}`,
          errorType: err.constructor.name,
        });
      }
      throw err;
    }
    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

router.post(
  '/games/:id/pseudoPlayers',
  requiresAuth,
  validateDisplayName(),
  checkRequestValidation,
  async (req, res) => {
    const { displayName } = req.body;
    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }
    try {
      game.addPseudoPlayer(PseudoUser.make(displayName));
      console.log('ctrl - addPseudoPlayer - game', game);
    } catch (err) {
      if (err instanceof GameError) {
        return res.status(StatusCodes.CONFLICT).send({
          errorMessage: `Unable to add player to game: ${err.message}`,
          errorType: err.constructor.name,
        });
      }
      throw err;
    }
    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

interface UpdateGameBody {
  name: string;
  ownerId: string;
}
router.patch(
  '/games/:id',
  requiresAuth,
  v.body('name').isString().isLength({ min: 5 }).optional().trim(),
  v.body('ownerId').isString().optional(),
  checkRequestValidation,
  async (req, res) => {
    const updates = req.body as UpdateGameBody;
    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }

    if (req.user!.id !== game.owner.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        errorMessage: 'You are not the owner of this game',
      });
    }

    let updated = false;

    try {
      if (updates.name && updates.name != game.name) {
        game.name = updates.name;
        updated = true;
      }

      if (updates.ownerId && updates.ownerId != game.owner.id) {
        if (game.changeOwner(updates.ownerId)) {
          updated = true;
        }
      }
    } catch (err) {
      if (err instanceof GameError) {
        return res.status(StatusCodes.CONFLICT).json({
          errorMessage: `Unable to update game: ${err.message}`,
          errorType: err.constructor.name,
        });
      }
      throw err;
    }

    if (updated) {
      req.di.repositories.game.update(game);
    }

    res.status(StatusCodes.OK).json(gameToDto(game));
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
          errorType: err.constructor.name,
        });
      }
      if (err instanceof GameError) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errorMessage: err.message,
          errorType: err.constructor.name,
        });
      }
      throw err;
    }
    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

const validateRoundParam = v.oneOf(
  [
    v.param('round').isInt().withMessage('not an integer').toInt(),
    v.param('round').equals('current').withMessage('not equal to current'),
  ],
  "round must be 'current' or a previous round number"
);

router.put(
  '/games/:id/rounds/:round/playerResult/:userId',
  requiresAuth,
  validateRoundParam,
  v.param('playerId').isMongoId(),
  v.body('points').isInt().toInt(),
  v.body('perfectDeckCut').isBoolean({ strict: true }),
  checkRequestValidation,
  async (req, res) => {
    const { round, playerId } = req.params;
    const { points, perfectDeckCut } = req.body;

    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }

    try {
      const roundNumber = round === 'current' ? undefined : parseInt(round);
      game.recordPlayerRoundResult(
        playerId,
        points,
        perfectDeckCut,
        roundNumber
      );
    } catch (err) {
      if (err instanceof GameError) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          errorMessage: err.message,
          details: { ...err },
          errorType: err.constructor.name,
        });
      }
      throw err;
    }

    req.di.repositories.game.update(game);
    res.json(gameToDto(game));
  }
);

interface PlayerResultBody {
  results: {
    [userId: string]: { points: number; perfectDeckCut?: boolean };
  };
}

router.put(
  '/games/:id/rounds/:round/playerResults',
  requiresAuth,
  validateRoundParam,
  v.body('results').isObject().notEmpty(),
  v.body('results.*.points').isInt().toInt(),
  v.body('results.*.perfectDeckCut').optional().isBoolean({ strict: true }),
  checkRequestValidation,
  async (req, res) => {
    const { round } = req.params;
    const { results } = req.body as PlayerResultBody;

    const game = await getGameOrSendFailure(req, res);
    if (!game) {
      return;
    }

    for (const [userId, result] of Object.entries(results)) {
      try {
        const roundNumber = round === 'current' ? undefined : parseInt(round);
        game.recordPlayerRoundResult(
          userId,
          result.points,
          result.perfectDeckCut,
          roundNumber
        );
      } catch (err) {
        if (err instanceof GameError) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            errorMessage: err.message,
            details: { ...err },
            errorType: err.constructor.name,
          });
        }
        throw err;
      }
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
  const id = idFn(req);
  const game = await req.di.gameService.getByShortId(id);
  if (!game) {
    res.status(StatusCodes.NOT_FOUND).send({
      errorMessage: `Game not found`,
    });
    return false;
  }
  return game;
}
