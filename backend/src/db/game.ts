import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { GameStage, GameRound, Game } from '../domain/game/game.model';
import { UserEntity } from './user';
import {
  getModelForClass,
  prop,
  plugin,
  Ref,
  DocumentType,
  modelOptions,
  isDocument,
  isDocumentArray,
} from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { GameRepository } from '../domain/game/game.repository';

@modelOptions({ options: { customName: 'games' } })
@plugin(autopopulate as any)
export class GameEntity extends TimeStamps {
  @prop()
  _id?: mongoose.Types.ObjectId;

  @prop()
  name?: string;

  @prop({ unique: true })
  shortId?: string;

  @prop()
  stage?: string;

  @prop({ ref: () => UserEntity, autopopulate: true })
  owner: Ref<UserEntity>;

  @prop({ ref: () => UserEntity, autopopulate: true })
  players: Ref<UserEntity>[] = [];

  @prop({ type: () => GameRound })
  rounds: GameRound[] = [];

  @prop()
  startedAt?: Date;

  @prop()
  endedAt?: Date;

  toDomain(this: DocumentType<GameEntity>): Game {
    console.log('owner', this.owner);
    console.log('players', this.players);
    if (!isDocument(this.owner) && this.owner) {
      throw new Error('Owner must be a document');
    }
    if (!isDocumentArray(this.players) && this.players) {
      throw new Error('Players must be documents');
    }
    const game = new Game(this.name!, this.owner?.toDomain(), this.shortId);
    game.id = this._id.toHexString();
    game.players = this.players.map((p) => {
      return p.toDomain();
    });
    game.stage = GameStage[this.stage! as keyof typeof GameStage];
    game.rounds = this.rounds;
    game.startedAt = this.startedAt;
    game.endedAt = this.endedAt;
    return game;
  }

  static fromDomain(game: Game): GameEntity {
    console.log('GAME', game);
    const entity = new GameEntity();
    entity._id = game.id
      ? new mongoose.Types.ObjectId(game.id)
      : new mongoose.Types.ObjectId();
    entity.players = game.players.map(UserEntity.fromDomain);
    entity.shortId = game.shortId;
    if (game.owner) {
      entity.owner = UserEntity.fromDomain(game.owner);
    }
    entity.name = game.name;
    entity.stage = game.stage;
    entity.rounds = game.rounds;
    entity.startedAt = game.startedAt;
    entity.endedAt = game.endedAt;
    return entity;
  }
}

export const GameDbModel = getModelForClass(GameEntity);

export class GameRepositoryMongo implements GameRepository {
  async getAll(): Promise<Game[]> {
    const games = await GameDbModel.find()
      .populate(['owner', 'players'])
      .exec();
    console.log('games', games);
    return games.map((db) => db.toDomain());
  }

  async getByShortId(shortId: string): Promise<Game | undefined> {
    const game = await GameDbModel.findOne({ shortId: shortId });
    return game?.toDomain();
  }

  async create(game: Game): Promise<Game> {
    const ent = await GameDbModel.create(GameEntity.fromDomain(game));
    const saved = await ent.save();
    return game;
  }

  async update(game: Game): Promise<Game> {
   const model = new GameDbModel(GameEntity.fromDomain(game));
   model.isNew = false;
   const saved = await model.save();
   return saved.toDomain();
  }
}
