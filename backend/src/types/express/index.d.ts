import express from 'express';
import { User } from '../../models';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
