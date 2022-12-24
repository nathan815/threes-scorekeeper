import express from 'express';
import { User } from '../../src/domain/user/user';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
