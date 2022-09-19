import 'express-session';
import { User } from '../../src/domain/User';

declare module 'express-session' {
  export interface SessionData {
    userId?: string;
    user?: User;
  }
}
