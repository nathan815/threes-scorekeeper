import express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as v from 'express-validator';

import * as gameTableService from '../gameTableService';
import * as userService from '../userService';
import { User, userToPrivateDto } from '../domain/User';

export const router = express.Router();

router.use(async (req, res, next) => {
  console.log(req.sessionID, req.session);
  if (req.session.userId) {
    req.user = await userService.getUser(req.session.userId);
  }
  console.log('user', req.user);
  next();
});

function checkRequestValidation(req, res, next) {
  const errors = v.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errorMessage:
        "There were errors in your request. See the 'errors' property for details.",
      errors: errors.array(),
    });
  }
  next();
}

function requiresNoAuth(req, res, next) {
  if (req.user) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errorMessage: 'Already authenticated',
    });
  }
  next();
}

function requiresAuth(req, res, next) {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errorMessage: 'Authentication required',
    });
  }
  next();
}

router.get('/', (req, res) => {
  res.send('Threes');
});

router.post(
  '/auth/register/guest',
  requiresNoAuth,
  v.body('displayName').isString(),
  checkRequestValidation,
  async (req, res) => {
    const user = await userService.createGuestUser({
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
  v.body('userId').isString(),
  v.body('secret').isString(),
  checkRequestValidation,
  async (req, res) => {
    const user = await userService.checkGuestUserSecret(
      req.body.userId,
      req.body.secret
    );
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED);
    }
    req.session.userId = user.id;
    return res.status(StatusCodes.OK).json({
      user: userToPrivateDto(user),
    });
  }
);

router.get('/tables', async (req, res) => {
  const tables = await gameTableService.getTables();
  return res.json(tables);
});

router.get(
  '/tables/:id',
  v.param('id').isString(),
  checkRequestValidation,
  async (req, res) => {
    const tables = await gameTableService.getTableByShortId(req.params.id);
    return res.json(tables);
  }
);

router.post(
  '/tables',
  requiresAuth,
  v.body('name').isString(),
  checkRequestValidation,
  async (req, res) => {
    const table = await gameTableService.createTable({
      name: req.body.name,
      createdBy: req.user,
    });
    res.json(table);
  }
);
