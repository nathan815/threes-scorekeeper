import express from 'express';
import { User } from '../../src/domain/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
