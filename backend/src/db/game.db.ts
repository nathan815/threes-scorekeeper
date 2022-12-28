import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import {
  GameStage,
  GameRound,
  Game,
  PlayerResultMap,
} from '../domain/game/game.model';
import { UserSchema } from './user.db';
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
import { cloneDeep } from 'lodash';
import { CardRank } from '../domain/game/cards';

class GameRoundSchema {
  @prop()
  cardRank?: number;

  @prop()
  playerResults?: PlayerResultMap;

  @prop()
  startedAt?: Date;

  @prop()
  endedAt?: Date;
}

@modelOptions({ options: { customName: 'games' } })
@plugin(autopopulate as any)
export class GameSchema extends TimeStamps {
  @prop()
  _id?: mongoose.Types.ObjectId;

  @prop()
  name?: string;

  @prop({ unique: true })
  shortId?: string;

  @prop()
  stage?: string;

  @prop({ ref: () => UserSchema, autopopulate: true })
  owner: Ref<UserSchema>;

  @prop({ ref: () => UserSchema, autopopulate: true })
  players: Ref<UserSchema>[] = [];

  @prop()
  rounds: GameRoundSchema[] = [];

  @prop()
  startedAt?: Date;

  @prop()
  endedAt?: Date;

  toDomain(this: DocumentType<GameSchema>): Game {
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
    game.rounds = this.rounds.map((r) => {
      const round = new GameRound(CardRank.of(r.cardRank!));
      round.startedAt = r.startedAt!;
      round.endedAt = r.endedAt!;
      round.playerResults = r.playerResults || {};
      return round;
    });
    game.startedAt = this.startedAt;
    game.endedAt = this.endedAt;
    console.debug('toDomain - GAME', game);
    return game;
  }

  static fromDomain(game: Game): GameSchema {
    console.debug('fromDomain - GAME', game);
    const entity = new GameSchema();
    entity._id = game.id
      ? new mongoose.Types.ObjectId(game.id)
      : new mongoose.Types.ObjectId();
    entity.players = game.players.map(UserSchema.fromDomain);
    entity.shortId = game.shortId;
    if (game.owner) {
      entity.owner = UserSchema.fromDomain(game.owner);
    }
    entity.name = game.name;
    entity.stage = game.stage;
    entity.rounds = cloneDeep(game.rounds).map(r => {
      const s = new GameRoundSchema();
      s.cardRank = r.cardRank.number;
      s.playerResults = r.playerResults;
      s.startedAt = r.startedAt;
      s.endedAt = r.endedAt;
      return s;
    });
    entity.startedAt = game.startedAt;
    entity.endedAt = game.endedAt;
    return entity;
  }
}

export const GameDbModel = getModelForClass(GameSchema);

export class GameRepositoryMongo implements GameRepository {
  async getAll(): Promise<Game[]> {
    const games = await GameDbModel.find().exec();
    console.debug('All games:', games);
    return games.map((db) => db.toDomain());
  }

  async getByShortId(shortId: string): Promise<Game | undefined> {
    const game = await GameDbModel.findOne({ shortId: shortId });
    return game?.toDomain();
  }

  async create(game: Game): Promise<Game> {
    const ent = await GameDbModel.create(GameSchema.fromDomain(game));
    const saved = await ent.save();
    return game;
  }

  async update(game: Game): Promise<Game> {
    const model = new GameDbModel(GameSchema.fromDomain(game));
    model.isNew = false;
    const saved = await model.save();
    return saved.toDomain();
  }
}
