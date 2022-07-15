import express from 'express';
import session from 'express-session';
import { body, validationResult } from 'express-validator';

import './config.js';
import './db.js';
import roomService from './roomService.js';
import userService from './userService.js';

const app = express();
const port = process.env.PORT || 8080;

const sessionConfig = {
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

app.use((req, res, next) => {
  if (req.session.userId) {
    req.user = userService.getUser(req.session.userId);
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/auth/anonymous', (req, res) => {
  const { displayName, userId } = req.body;
  const user = userService.getUser(userId);
  if (user) {
    return res.status(400).json({
      error: 'Already authenticated',
    });
  }
  const newUser = userService.createAnonymousUser({ displayName });
  res.status(200).json(newUser);
});

app.get('/rooms', (req, res) => {
  const rooms = roomService.getRooms();
  res.json(rooms);
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;
  roomService.createRoom({
    name,
    createdBy: req.user,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
