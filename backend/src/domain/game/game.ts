import { ALL_CARDS, Card, CardRank } from './cards';
import { User } from '../user/user';
import ShortUniqueId from 'short-unique-id';
import { generateJoinCode } from '../../utils/generateJoinCode';

const MAX_PLAYERS = 8;

const TOTAL_ROUNDS = 13;

export enum GameStage {
  Pre = 'Pre',
  InProgress = 'InProgress',
  Done = 'Done',
}

interface PlayerPoints {
  [userId: string]: number;
}

export class Game {
  id?: string;
  joinCode: string;
  stage: GameStage = GameStage.Pre;
  players: User[] = [];
  rounds: GameRound[] = [];
  startedAt?: Date;
  endedAt?: Date;

  constructor(public owner: User) {
    this.addPlayer(owner);
    this.joinCode = generateJoinCode();
  }

  get currentRound(): GameRound | undefined {
    if (this.endedAt || this.rounds.length == 0) {
      return;
    }
    return this.rounds[this.rounds.length - 1];
  }

  get winningPlayer(): User | undefined {
    if (this.stage == GameStage.Pre) {
      return;
    }

    let minPointsUserId: string;
    let minPoints = Number.MAX_VALUE;
    for (const round of this.rounds) {
      for (const userId of Object.keys(round.playerPoints)) {
        if (round.playerPoints[userId] < minPoints) {
          minPointsUserId = userId;
        }
      }
    }
    return this.players.find((u) => u.id == minPointsUserId);
  }

  addPlayer(player: User): boolean {
    if (this.players.length == MAX_PLAYERS) {
      return false;
    }
    if (this.players.find((u) => u.id == player.id)) {
      // User is already added to this game.
      return false;
    }
    this.players.push(player);
    return true;
  }

  getPlayerPoints(player: User): number {
    return this.rounds
      .map((round) => round.playerPoints[player.id])
      .reduce((prev, cur) => prev + cur, 0);
  }

  start() {
    if (this.stage != GameStage.Pre) {
      throw new Error('Cannot start game in this stage: ' + this.stage);
    }

    if (this.players.length < 2) {
      throw new Error('Cannot start game unless there are 2 or more players');
    }

    this.startedAt = new Date();
    this.stage = GameStage.InProgress;
    this.nextRound();
  }

  finish() {
    if (this.stage == GameStage.Done) {
      return;
    }

    this.endedAt = new Date();
    this.stage = GameStage.Done;
  }

  finishRound(playerPoints: PlayerPoints) {
    if (!this.currentRound) {
      throw new Error('No round in progress');
    }
    for (const id in Object.keys(playerPoints)) {
      if (!this.players[id]) {
        throw new Error(`User ID ${id} not in this game`);
      }
    }
    for (const id in Object.keys(this.players)) {
      if (!playerPoints[id]) {
        throw new Error(`Points no provided for user ID ${id}`);
      }
    }
    this.currentRound.finish(playerPoints);
  }

  nextRound() {
    if (this.stage != GameStage.InProgress) {
      throw new Error(
        `Game must be in progress to go to next round. Current stage is: ${this.stage}`
      );
    }
    
    if (this.rounds.length == TOTAL_ROUNDS) {
      this.finish();
      return;
    }

    if (this.currentRound && !this.currentRound.isFinished) {
      throw new Error('Current round is not finished');
    }

    const curRankNum = this.currentRound?.cardRank.number ?? 0;
    const nextRank = CardRank.of(curRankNum + 1);
    this.rounds.push(new GameRound(this, nextRank));
  }
}

export class GameRound {
  startedAt: Date;
  endedAt?: Date;
  playerPoints: PlayerPoints = {};

  public constructor(public game: Game, public cardRank: CardRank) {
    this.startedAt = new Date();
  }

  get isFinished() {
    return Boolean(this.endedAt);
  }

  finish(playerPoints: PlayerPoints) {
    if (this.isFinished) {
      throw new Error('Round is already finished');
    }
    this.playerPoints = playerPoints;
    this.endedAt = new Date();
  }
}
