import MongoStore from 'connect-mongo';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';

import './config';
import config from './config';
import { configureDb, MONGO_OPTIONS, MONGO_URL } from './db';
import { injectDIMiddleware } from './di';
import { mainRouter } from './http';
import { injectCurrentUser } from './http/middleware';
import { setupPassport } from './passportConfig';

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

  app.use(express.static(__dirname + '/http/public'));
  app.use(session(sessionConfig));
  app.use(express.json());
  app.use(injectDIMiddleware);

  setupPassport(app);

  app.use(injectCurrentUser);
  app.use(mainRouter);

  app.use((req, res, next) => {
    res.status(404).json({
      errorMessage: `No route defined for ${req.method} ${req.path}`,
    });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err, err.stack);
    res.status(500).json({
      errorMessage: 'Something went wrong.',
      exception: {
        type: err.name,
        message: err.message,
        stack: err.stack?.split('\n'),
        ...err,
      },
    });
  });

  return app;
}

async function main() {
  const port = config.app.port;
  const app = await createApp();

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main();
