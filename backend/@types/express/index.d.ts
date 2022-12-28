import express from 'express';
import { User } from '../../src/domain/user/user.model';
import { DIContainer } from '../../src/di';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      di: DIContainer;
    }
  }
}
