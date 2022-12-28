import { User } from './user.model';

export interface UserRepository {
  getById(id: string): Promise<User | undefined>;

  getUsers(): Promise<User[]>;

  save(user: User): Promise<User>;
}
