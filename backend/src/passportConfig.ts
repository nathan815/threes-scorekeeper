import { Application, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config';
import { FederatedCredentialsDbModel } from './db/auth.db';
import { UserDbModel } from './db/user.db';
import { DI } from './di';
import { AuthError, AuthUserNotFoundError } from './domain/auth/auth.service';

export function setupPassport(app: Application) {
  app.use(passport.session());
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AuthUserNotFoundError) {
      console.error('Authenticated user not found. Logging out.');
      return req.logout(next);
    }
    next();
  });

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    const user = await DI.userService.getUser(id);
    if (user) {
      done(null, user);
    } else {
      done(new AuthUserNotFoundError('User not found'));
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.secret,
        scope: ['openid', 'profile', 'email'],
        passReqToCallback: true,
      },
      async function verify(req, accessToken, refreshToken, profile, done) {
        const provider = 'https://accounts.google.com';

        console.log('google oauth verify');

        console.log('accessToken', accessToken, 'refreshToken', refreshToken);
        console.log('profile', profile);

        try {
          const cred = await FederatedCredentialsDbModel.findOne({
            provider,
            subject: profile.id,
          });

          console.log('cred:', cred);

          if (cred) {
            // User has previously signed in with this account.
            if (!cred.user) {
              throw new AuthError('Credential user not loaded or missing');
            }
            return done(null, new UserDbModel(cred.user).toDomain(), { isNew: false });
          }

          const { state } = req.query;
          const { displayName = null } = state
            ? JSON.parse(
                Buffer.from(state as string, 'base64url').toString('utf-8')
              )
            : {};

          // TODO add unique number to end of this name
          const providerDisplayName =
            profile.name?.givenName || profile.username || profile.displayName;

          console.log('profile.emails[0]', profile.emails?.[0]);

          const email = profile.emails?.[0]?.value;

          const user = await DI.userService.createUser({
            displayName: displayName || providerDisplayName,
            email,
          });

          const newCred = await FederatedCredentialsDbModel.create({
            _id: new mongoose.Types.ObjectId(),
            user: UserDbModel.fromDomain(user),
            provider,
            subject: profile.id,
            profile,
          });
          console.log('google oauth new cred document', newCred);

          return done(null, user, { isNew: true });
        } catch (err: any) {
          return done(err);
        }
      }
    )
  );
}
