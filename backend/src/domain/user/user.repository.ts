import { User } from "./user.model";

export interface UserRepository {
  getById(id: string): Promise<User | undefined>

  save(user: User): Promise<User>
}
