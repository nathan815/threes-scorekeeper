import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as v from 'express-validator';

export async function injectCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.sessionID, req.session);
  if (req.session.userId) {
    const user = await req.di.userService.getUser(req.session.userId);
    if (user) {
      req.user = user;
    } else {
      console.error('User ID in session does not exist: ' + req.session.userId);
    }
  }
  console.log('user', req.user);
  next();
}

export function checkRequestValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = v.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errorMessage:
        "There were errors in your request. See the 'errors' property for details.",
      errors: errors.array(),
    });
  }
  next();
}

export function requiresNoAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errorMessage: 'Unauthenticated only route',
    });
  }
  next();
}

export function requiresAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errorMessage: 'Authentication required',
    });
  }
  next();
}
