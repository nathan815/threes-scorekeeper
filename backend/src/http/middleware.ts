import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as v from 'express-validator';

export async function injectAuthGuestUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session.guestUserId) {
    if (req.user) {
      console.warn(
        'User is already injected on the request object, ignoring guestUserId'
      );
    } else {
      const user = await req.di.userService.getUser(req.session.guestUserId);
      if (user) {
        req.user = user;
      } else {
        console.error(
          'Guest User ID in session does not exist: ' + req.session.guestUserId
        );
      }
    }
  }

  console.log(
    req.method,
    req.url,
    'Session:',
    req.sessionID,
    'User:',
    req.user?.id,
    'DisplayName:',
    req.user?.displayName,
    'IsGuest:',
    req.user?.isGuest
  );
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
      errorType: 'validation',
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
