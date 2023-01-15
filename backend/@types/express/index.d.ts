// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DIContainer } from '../../src/di';
import { User as AppUser } from '../../src/domain/user/user.model';

declare global {
  namespace Express {
    interface Request {
      di: DIContainer;
    }

    // Here we are extending existing Express.User to include our AppUser.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AppUser {}
  }
}
