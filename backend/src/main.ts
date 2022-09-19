import express from 'express';
import session from 'express-session';

import './config';
import './db';
import { router } from './http/routes';

const app = express();
const port = process.env.PORT || 8080;

const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionConfig.cookie.secure = true; // serve secure cookies
}
app.use(session(sessionConfig));
app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
