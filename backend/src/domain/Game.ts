import { Table } from './Table';
import { User } from './User';

export class Game {
  public constructor(obj: Partial<Game>) {
    Object.assign(this, obj);
  }
  id: string;
  table?: Table;
  players: User[];
}
