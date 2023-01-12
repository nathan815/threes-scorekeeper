import Router from 'express-promise-router';
import { router as authRouter } from './auth.controller';
import { router as gameRouter } from './game.controller';
import { userToDto } from '../domain/user/user.dto';
import { getReqBaseUrl } from '../utils/request';

const bootTime = new Date();

export const mainRouter = Router();

mainRouter.use(authRouter);
mainRouter.use(gameRouter);

mainRouter.get('/', (req, res) => {
  res.json({
    name: 'Threes Scorekeeper API',
    uptimeMs: new Date().valueOf() - bootTime.valueOf(),
    host: req.hostname,
    baseUrl: getReqBaseUrl(req),
    proxy: req.header('X-Proxy'),
  });
});

mainRouter.get('/users', async (req, res) => {
  const users = await req.di.userService.getUsers();
  return res.json(users.map(userToDto));
});
