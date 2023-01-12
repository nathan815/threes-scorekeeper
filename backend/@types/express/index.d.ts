import express from 'express';
import { User as AppUser } from '../../src/domain/user/user.model';
import { DIContainer } from '../../src/di';

declare global {
  namespace Express {
    interface Request {
      di: DIContainer;
    }

    interface User extends AppUser {}
  }
}
