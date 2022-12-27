import express from 'express';
import { User } from '../../src/domain/user/user.model';
import { DI } from "../../src/di";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      di: DI;
    }
  }
}
