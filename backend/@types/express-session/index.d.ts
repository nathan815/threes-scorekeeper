import 'express-session';
import { User } from '../../src/domain/user/user.model';

declare module 'express-session' {
  export interface SessionData {
    userId?: string;
    user?: User;
  }
}
