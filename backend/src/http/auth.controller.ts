import Router from 'express-promise-router';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';

import { NextFunction, Request, Response } from 'express';
import * as v from 'express-validator';
import { userToDto, userToPrivateDto } from '../domain/user/user.dto';
import { User } from '../domain/user/user.model';
import { getReqBaseUrl } from '../utils/request';
import { checkRequestValidation, requiresNoAuth } from './middleware';
import { validateDisplayName } from './validators';

export const router = Router();

router.get('/auth', (req, res) => {
  res.json({
    user: req.user ? userToDto(req.user) : null,
  });
});

router.post(
  '/auth/guest/register',
  requiresNoAuth,
  validateDisplayName(),
  checkRequestValidation,
  async (req, res) => {
    const user = await req.di.userService.createGuestUser({
      displayName: req.body.displayName,
    });
    req.session.guestUserId = user.id;
    console.log(req.session.guestUserId, req.session);
    return res.status(StatusCodes.CREATED).json({
      guestSecret: user.guestSecret,
      user: userToPrivateDto(user),
    });
  }
);

router.post(
  '/auth/guest/login',
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
    req.session.guestUserId = user.id;
    return res.status(StatusCodes.OK).json({
      user: userToPrivateDto(user),
    });
  }
);

router.post('/auth/logout', (req, res) => {
  req.session.guestUserId = undefined;
  req.logOut({}, () => {
    res.json('success');
  });
});

router.get('/auth/google', (req, res, next) => {
  const { displayName } = req.query;

  const state = Buffer.from(
    JSON.stringify({
      displayName,
      currentUserId: req.user?.id,
    })
  ).toString('base64url');

  const callbackURL = `${getReqBaseUrl(req)}/auth/google/callback`;
  console.log('google oauth begin: callbackURL', callbackURL);

  passport.authenticate('google', {
    callbackURL,
    state,
    prompt: 'select_account',
  })(req, res, next);
});

function getCallbackParameteres(req: Request) {
  const baseURL = getReqBaseUrl(req);
  const callbackURL = `${baseURL}/auth/google/callback`;
  const basePopupURL = (user?: User) =>
    `${baseURL}/auth-popup.html?provider=google&user=${JSON.stringify(
      user && userToDto(user)
    )}`;
  const successRedirect = (user: User, isNew: boolean) =>
    `${basePopupURL(user)}&result=success&isNew=${isNew}`;
  const failureRedirect = (msg: string) =>
    `${basePopupURL()}&result=failure&error=${encodeURIComponent(msg)}`;

  return { callbackURL, successRedirect, failureRedirect };
}

router.get(
  '/auth/google/callback',
  (req: Request, res: Response, next: NextFunction) => {
    console.log('google oauth callback');

    const { callbackURL, successRedirect, failureRedirect } =
      getCallbackParameteres(req);

    passport.authenticate(
      'google',
      { callbackURL },
      (err, user, info: { isNew: boolean }) => {
        console.log('google oauth callback - authenticate');
        console.log('err', err, 'info', info);
        if (err) return next(err);

        if (!user) {
          console.error('google oauth callback: user missing');
          return res.redirect(failureRedirect('missing user'));
        }

        req.logIn(user, { callbackURL }, function (err: any) {
          console.log('google oauth callback - req.logIn');

          if (err) {
            console.error('google oauth callback - logIn - failure', err);
            return res.redirect(failureRedirect(err.message || err));
          }

          return res.redirect(successRedirect(user, info.isNew));
        });
      }
    )(req, res, next);
  },

  (err: Error, req: Request, res: Response, next: NextFunction) => {
    const { failureRedirect } = getCallbackParameteres(req);
    res.redirect(
      failureRedirect(
        JSON.stringify({
          name: err.name,
          message: err.message,
          stack: err.stack,
        })
      )
    );
  }
);
