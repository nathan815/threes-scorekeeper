import { Game } from "./game";
import { User } from "./User";

export class Table {
  public constructor(obj: Partial<Table>) {
    Object.assign(this, obj);
  }
  id: string;
  shortId: string;
  name: string;
  members: User[];
  games: Game[];
}
