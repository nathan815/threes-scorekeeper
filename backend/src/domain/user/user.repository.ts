import { User } from './user.model';

export interface UserRepository {
  getById(id: string): Promise<User | undefined>;

  getUsers(): Promise<User[]>;

  create(user: User): Promise<User>;

  update(user: User): Promise<User>;
}
