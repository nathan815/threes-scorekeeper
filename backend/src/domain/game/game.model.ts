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
      for (const userId of Object.keys(round.playerResults)) {
        totals[userId] =
          (totals[userId] || 0) + round.playerResults[userId].points;
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
      throw new IllegalGameStageError(
        `Game must be in ${GameStage.Pre} stage to add players`
      );
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
      .map((round) => round.playerResults[player.id].points)
      .reduce((prev, cur) => prev + cur, 0);
  }

  start(startedBy: User) {
    if (startedBy.id != this.owner!.id) {
      throw new NonOwnerCannotStartGameError(
        'Only the owner can start the game.'
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

  recordPlayerRoundResult(result: PlayerRoundResult) {
    if (!this.currentRound) {
      throw new Error('No round in progress');
    }
    if (!this.players.some((u) => u.id == result.userId)) {
      throw new Error(`No player with ID ${result.userId} in this game`);
    }
    return this.currentRound.recordPlayerResult(result);
  }

  finishRound() {
    const currentRound = this.currentRound;
    if (!currentRound) {
      throw new Error('No round in progress');
    }
    const missingPlayerIds = this.players
      .map((player) => player.id)
      .filter((id) => !currentRound.playerResults.hasOwnProperty(id));
    if (missingPlayerIds.length > 0) {
      throw new ResultNotRecordedForPlayersError(missingPlayerIds);
    }
    currentRound.finish();
  }

  nextRound() {
    if (this.stage != GameStage.InProgress) {
      throw new IllegalGameStageError(
        `Game must be in stage ${GameStage.InProgress} to go to next round.`
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
  playerResults: PlayerResultMap = {};

  public constructor(public game: Game, public cardRank: CardRank) {
    this.startedAt = new Date();
  }

  get isFinished() {
    return Boolean(this.endedAt);
  }

  recordPlayerResult(result: PlayerRoundResult) {
    this.playerResults[result.userId] = result;
  }

  finish() {
    if (this.isFinished) {
      throw new Error('Round is already finished');
    }
    this.endedAt = new Date();
  }
}

const PERFECT_DECK_CUT_BONUS = -20;

interface PlayerResultMap {
  [userId: string]: PlayerRoundResult;
}

export class PlayerRoundResult {
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

export class IllegalGameStageError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class NonOwnerCannotStartGameError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class ResultNotRecordedForPlayersError extends Error {
  constructor(playerIds: string[]) {
    super(`Result not recorded for player IDs: ${playerIds.join(', ')}`);
  }
}
