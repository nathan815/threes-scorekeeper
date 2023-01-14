import Router from 'express-promise-router';
import { getReqBaseUrl } from '../utils/request';
import { router as authRouter } from './auth.controller';
import { router as gameRouter } from './game.controller';
import { router as userRouter } from './user.controller';

const bootTime = new Date();

export const mainRouter = Router();

mainRouter.use(userRouter);
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
