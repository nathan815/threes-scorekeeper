import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';

import './config';
import { configureDb } from './db';
import { injectDIMiddleware } from './di';
import { injectCurrentUser } from './http/middleware';
import { router } from './http/routes';

async function createApp() {
  const app = express();

  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  };

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionConfig.cookie!.secure = true; // serve secure cookies
  }

  app.use(session(sessionConfig));
  app.use(express.json());

  await configureDb();

  app.use(injectDIMiddleware);
  app.use(injectCurrentUser);

  app.use(router);

  return app;
}

async function main() {
  const port = process.env.PORT || 8080;
  const app = await createApp();

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main();
