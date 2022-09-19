import {
  prop,
  Ref,
  getModelForClass,
  DocumentType,
  isDocumentArray,
} from '@typegoose/typegoose';
import { Table } from '../domain/Table';
import { BaseEntity } from './BaseEntity';
import { GameEntity } from './game';
import { UserEntity } from './user';

export class GameTableEntity extends BaseEntity {
  public static Model = getModelForClass(GameTableEntity, {
    options: {
      customName: 'GameTable',
    },
  });

  public static newInstance(data: Partial<GameTableEntity>) {
    return new this.Model(data);
  }

  @prop()
  public shortId: string;

  @prop()
  public name: string;

  @prop({ ref: () => UserEntity })
  public createdBy: Ref<UserEntity>;

  @prop({ ref: () => UserEntity })
  public host: Ref<UserEntity>;

  @prop({ ref: () => UserEntity })
  public members: Ref<UserEntity>[];

  @prop({ ref: () => GameEntity })
  public games: Ref<GameEntity>[];

  @prop()
  public email: string;

  toDomain(this: DocumentType<GameTableEntity>): Table {
    return new Table({
      id: this.id,
      shortId: this.shortId,
      name: this.name,
      members: isDocumentArray(this.members)
        ? this.members.map((doc) => doc.toDomain())
        : undefined,
      games: isDocumentArray(this.games)
        ? this.games.map((doc) => doc.toDomain())
        : undefined,
    });
  }
}
