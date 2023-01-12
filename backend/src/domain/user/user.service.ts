import { User } from './user.model';
import { generateSecret } from '../../utils/generateSecret';
import { UserRepository } from './user.repository';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string): Promise<User | undefined> {
    return await this.userRepo.getById(id);
  }

  getUsers(): Promise<User[]> {
    return this.userRepo.getUsers();
  }

  async checkGuestUserSecret(
    id: string,
    secret: string
  ): Promise<User | null | false> {
    const user = await this.userRepo.getById(id);
    if (!user) {
      return null;
    }
    if (user.guestSecret != secret) {
      return false;
    }
    return user;
  }

  async createGuestUser({
    displayName,
  }: {
    displayName: string;
  }): Promise<User> {
    const secret = await generateSecret();
    let user = new User({
      displayName: displayName,
      guestSecret: secret,
    });
    user = await this.userRepo.save(user);
    return user;
  }

  async createUser({
    displayName,
    email,
  }: {
    displayName?: string;
    email?: string;
  }): Promise<User> {
    let user = new User({
      displayName,
      email,
    });
    user = await this.userRepo.save(user);
    return user;
  }
}
