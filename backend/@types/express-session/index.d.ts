import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    guestUserId?: string;
  }
}
