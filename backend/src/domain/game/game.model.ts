import { CardRank } from './cards';
import { User } from '../user/user.model';
import { generateShortId } from '../../utils/generateShortId';

const MAX_PLAYERS = 8;
const TOTAL_ROUNDS = 13;

export enum GameStage {
  Pre = 'Pre',
  InProgress = 'InProgress',
  Done = 'Done',
}

export class NonOwnerCannotStartGame extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class Game {
  id!: string;
  stage: GameStage = GameStage.Pre;
  players: User[] = [];
  rounds: GameRound[] = [];
  startedAt?: Date;
  endedAt?: Date;

  constructor(
    public name: string,
    public owner: User | undefined,
    public shortId: string = generateShortId()
  ) {
    if (owner) {
      this.addPlayer(owner);
    }
  }

  get currentRound(): GameRound | undefined {
    if (this.endedAt || this.rounds.length == 0) {
      return;
    }
    return this.rounds[this.rounds.length - 1];
  }

  get totalPointsByPlayer(): { [userId: string]: number } {
    const totals: { [userId: string]: number } = {};
    for (const round of this.rounds) {
      for (const userId of Object.keys(round.playerPoints)) {
        totals[userId] =
          (totals[userId] || 0) + round.playerPoints[userId].points;
      }
    }
    return totals;
  }

  get winningPlayer(): User | undefined {
    if (this.stage == GameStage.Pre) {
      return;
    }

    let minPointsUserId: string;
    let minPoints = Number.MAX_VALUE;
    for (const userId of Object.keys(this.totalPointsByPlayer)) {
      if (this.totalPointsByPlayer[userId] < minPoints) {
        minPoints = this.totalPointsByPlayer[userId];
        minPointsUserId = userId;
      }
    }
    return this.players.find((u) => u.id == minPointsUserId);
  }

  addPlayer(player: User): boolean {
    if (!(player instanceof User)) {
      throw new Error(`Invalid player user object: ${player}`);
    }
    if (this.stage != GameStage.Pre) {
      throw new Error(`Game must be in ${GameStage.Pre} stage to add players`);
    }
    if (this.players.some((u) => u.id == player.id)) {
      // Player is already in the game. All good.
      return true;
    }
    if (this.players.length >= MAX_PLAYERS) {
      throw new Error(`Maximum of ${MAX_PLAYERS} players reached`);
    }
    this.players.push(player);
    return true;
  }

  getPlayerPoints(player: User): number {
    return this.rounds
      .map((round) => round.playerPoints[player.id].points)
      .reduce((prev, cur) => prev + cur, 0);
  }

  start(user: User) {
    if (user.id != this.owner!.id) {
      throw new NonOwnerCannotStartGame(
        'You are not the game owner. Only the owner can start the game.'
      );
    }

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

  finishRound(playerPoints: PlayerRoundPoints[]) {
    if (!this.currentRound) {
      throw new Error('No round in progress');
    }
    for (let playerRound of playerPoints) {
      if (!this.players.some((u) => u.id == playerRound.userId)) {
        throw new Error(`No player with ID ${playerRound.userId} in this game`);
      }
      this.currentRound.recordPointsForPlayer(playerRound);
    }
    for (let player of this.players) {
      if (
        !Object.keys(this.currentRound.playerPoints).some(
          (id) => id == player.id
        )
      ) {
        throw new Error(`Points not provided for player ID ${player.id}`);
      }
    }
    this.currentRound.finish();
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
  playerPoints: PlayerPointsMap = {};

  public constructor(public game: Game, public cardRank: CardRank) {
    this.startedAt = new Date();
  }

  get isFinished() {
    return Boolean(this.endedAt);
  }

  recordPointsForPlayer(points: PlayerRoundPoints) {
    this.playerPoints[points.userId] = points;
  }

  finish() {
    if (this.isFinished) {
      throw new Error('Round is already finished');
    }
    this.endedAt = new Date();
  }
}

const PERFECT_DECK_CUT_BONUS = -20;

interface PlayerPointsMap {
  [userId: string]: PlayerRoundPoints;
}

export class PlayerRoundPoints {
  public userId: string;

  constructor(
    user: User,
    public cardPoints: number,
    public cutDeckPerfectly: boolean = false
  ) {
    this.userId = user.id;
  }

  get points() {
    const bonus = this.cutDeckPerfectly ? PERFECT_DECK_CUT_BONUS : 0;
    return this.cardPoints + bonus;
  }
}
