import { Request, Response } from 'express';
import Router from 'express-promise-router';
import {
  UserPrivateDto,
  UserPublicDto,
  userToDto,
  userToPrivateDto,
} from '../domain/user/user.dto';
import { checkRequestValidation, requiresAuth } from './middleware';
import { validateDisplayName } from './validators';

export const router = Router();

router.get('/users', async (req: Request, res: Response<UserPublicDto[]>) => {
  const users = await req.di.userService.getUsers();
  return res.json(users.map(userToDto));
});

interface UpdateUserRequest {
  displayName: string;
}
router.patch(
  '/users/me',
  requiresAuth,
  validateDisplayName({ optional: true }),
  checkRequestValidation,
  async (
    req: Request<{}, UpdateUserRequest>,
    res: Response<UserPrivateDto>
  ) => {
    const { displayName } = req.body;
    const user = req.user!;
    if (user.displayName && user.displayName !== displayName) {
      user.displayName = displayName;
      await req.di.userService.save(user);
    }
    res.status(200).json(userToPrivateDto(user));
  }
);
