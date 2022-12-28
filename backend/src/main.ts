import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import './config';
import { configureDb, MONGO_OPTIONS, MONGO_URL } from './db';
import { injectDIMiddleware } from './di';
import { injectCurrentUser } from './http/middleware';
import { router } from './http/routes';

async function createApp() {
  const app = express();

  const isProduction = app.get('env') === 'production';

  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: isProduction,
    },
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      mongoOptions: {
        auth: {
          username: MONGO_OPTIONS.user,
          password: MONGO_OPTIONS.pass,
        },
        authSource: MONGO_OPTIONS.authSource,
      },
    }),
  };

  if (isProduction) {
    app.set('trust proxy', 1); // trust first proxy
  }

  await configureDb();

  app.use(session(sessionConfig));
  app.use(express.json());
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
