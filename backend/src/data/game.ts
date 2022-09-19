import {
  getModelForClass,
  isDocument,
  isDocumentArray,
  prop,
  Ref,
} from '@typegoose/typegoose';
import { BaseEntity } from './BaseEntity';
import { GameTableEntity } from './gameTable';
import { Types } from 'mongoose';
import { Game } from '../domain/game';
import { UserEntity } from './user';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';

export class GameEntity implements Base {
  public static Model = getModelForClass(GameEntity, {
    options: {
      customName: 'Game'
    }
  });

  _id: Types.ObjectId;
  id: string;

  public static newInstance(data: Partial<GameEntity>) {
    return new this.Model(data);
  }

  @prop({ ref: () => GameTableEntity })
  table: Ref<GameTableEntity>;

  @prop({ ref: () => UserEntity })
  players: Ref<UserEntity>[];

  toDomain(): Game {
    return new Game({
      table: isDocument(this.table) ? this.table.toDomain() : undefined,
      players: isDocumentArray(this.players)
        ? this.players.map((doc) => doc.toDomain())
        : [],
    });
  }
}
