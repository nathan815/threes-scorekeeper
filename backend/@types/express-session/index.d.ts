import 'express-session';
import { User } from '../../src/domain/user/user';

declare module 'express-session' {
  export interface SessionData {
    userId?: string;
    user?: User;
  }
}
