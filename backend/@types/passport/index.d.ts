import 'passport';

declare module 'passport' {
  interface AuthenticateOptions {
    callbackURL?: string;
  }
}
