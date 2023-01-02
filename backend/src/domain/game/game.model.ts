import { CardRank } from './cards';
import { User } from '../user/user.model';
import { generateShortId } from '../../utils/generateShortId';

const MAX_PLAYERS = 8;
const START_ROUND = 3;
const END_ROUND = 11;
const PERFECT_DECK_CUT_BONUS = -20;

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

  get currentRoundNumber(): number | undefined {
    return this.currentRound?.cardRank.number;
  }

  totalPointsByPlayer(includeUnfinished = true): { [userId: string]: number } {
    // console.log('enter totalPointsByPlayer', 'rounds', this.rounds);
    const totals: { [userId: string]: number } = {};
    for (const player of this.players) {
      totals[player.id] =
        (totals[player.id] || 0) +
        this.getPlayerPoints(player, includeUnfinished);
    }
    return totals;
  }

  /**
   * The current winner (player with least amount of points).
   * Multiple players will be returned when there is a tie.
   * */
  get currentWinners(): User[] {
    if (this.stage == GameStage.Pre) {
      return [];
    }

    let minPointsUserIds: string[] = [];
    let minPoints = Number.MAX_VALUE;
    for (const [userId, points] of Object.entries(this.totalPointsByPlayer())) {
      if (points == minPoints) {
        minPointsUserIds.push(userId);
      } else if (points < minPoints) {
        minPoints = points;
        minPointsUserIds = [userId];
      }
    }
    return this.players.filter((u) => minPointsUserIds.includes(u.id));
  }

  addPlayer(player: User): boolean {
    if (!(player instanceof User)) {
      throw new GameError(`Invalid player user object: ${player}`);
    }
    if (this.stage != GameStage.Pre) {
      throw new IllegalGameStageError(
        `Cannot add players in stage ${this.stage}`
      );
    }
    if (this.players.some((u) => u.id == player.id)) {
      // Player is already in the game. All good.
      return true;
    }
    if (this.players.length >= MAX_PLAYERS) {
      throw new GameError(`Maximum of ${MAX_PLAYERS} players reached`);
    }
    this.players.push(player);
    return true;
  }

  getPlayerPoints(player: User, includeUnfinished = false): number {
    return this.rounds
      .filter((round) => includeUnfinished || round.isFinished)
      .map((round) => {
        const result = round.playerResults[player.id];
        return result ? result.cardPoints + (result.perfectCutBonus || 0) : 0;
      })
      .reduce((prev, cur) => prev + cur, 0);
  }

  start(startedBy: User) {
    if (startedBy.id != this.owner!.id) {
      throw new NonOwnerCannotStartGameError();
    }

    if (this.stage != GameStage.Pre) {
      throw new GameError('Game has already been started');
    }

    if (this.players.length < 2) {
      throw new GameError(
        'Cannot start game unless there are 2 or more players'
      );
    }

    this.startedAt = new Date();
    this.stage = GameStage.InProgress;
    this.nextRound();
    console.log('End of start - game =', this);
  }

  finish() {
    if (this.stage == GameStage.Done) {
      return;
    }

    this.endedAt = new Date();
    this.stage = GameStage.Done;
  }

  recordPlayerRoundResult(
    player: User,
    points: number,
    cutDeckPerfectly: boolean = false,
    roundNumber?: number
  ) {
    let round: GameRound;
    if (typeof roundNumber === 'undefined') {
      if (!this.currentRound) {
        throw new GameError('No round in progress');
      }
      round = this.currentRound;
    } else {
      if (roundNumber < START_ROUND || roundNumber > END_ROUND) {
        throw new GameError('Invalid round number provided', {
          roundNumber,
          startRound: START_ROUND,
          endRound: END_ROUND,
        });
      }
      const foundRound = this.rounds.find(
        (r) => r.cardRank.number == roundNumber
      );
      if (!foundRound) {
        throw new GameError(
          `Round for card rank ${roundNumber} has not yet been played on this game`
        );
      }
      round = foundRound;
    }

    if (!this.players.some((u) => u.id == player.id)) {
      throw new GameError(`No player with ID ${player.id} in this game`);
    }
    return round.recordPlayerResult({
      userId: player.id,
      cardPoints: points,
      perfectCutBonus: cutDeckPerfectly ? PERFECT_DECK_CUT_BONUS : 0,
    });
  }

  nextRound() {
    if (this.stage != GameStage.InProgress) {
      throw new IllegalGameStageError(
        `Game must be in stage ${GameStage.InProgress} to go to next round.`
      );
    }

    this.finishCurrentRound();

    if (this.rounds.length == END_ROUND) {
      this.finish();
      return;
    }

    const curRank = this.currentRound?.cardRank.number;
    const nextRank = CardRank.of(curRank ? curRank + 1 : START_ROUND);
    const round = new GameRound(nextRank);
    this.rounds.push(round);
    console.log('new round', round, 'ROUNDS', this.rounds);
  }

  finishCurrentRound() {
    const currentRound = this.currentRound;
    // console.log('currentRound', currentRound);
    if (!currentRound || currentRound.isFinished) {
      return;
    }
    const missingPlayerIds = this.players
      .map((player) => player.id)
      .filter((id) => !currentRound.playerResults.hasOwnProperty(id));

    if (missingPlayerIds.length > 0) {
      throw new ResultNotRecordedForPlayersError(
        this.currentRoundNumber!,
        missingPlayerIds
      );
    }
    currentRound.finish();
  }
}

export class GameRound {
  startedAt: Date;
  endedAt?: Date;
  playerResults: PlayerResultMap = {};

  public constructor(public cardRank: CardRank) {
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
      throw new GameError('Round is already finished');
    }
    this.endedAt = new Date();
  }
}

export interface PlayerResultMap {
  [userId: string]: PlayerRoundResult;
}

export interface PlayerRoundResult {
  userId: string;
  cardPoints: number;
  perfectCutBonus: number;
}

export class GameError extends Error {
  constructor(msg: string, public context?: any) {
    super(msg);
  }
}

export class IllegalGameStageError extends GameError {
  constructor(msg: string) {
    super(msg);
  }
}

export class NonOwnerCannotStartGameError extends GameError {
  constructor() {
    super('Only the owner can start the game.');
  }
}

export class ResultNotRecordedForPlayersError extends GameError {
  constructor(public roundNumber: number, public playerIds: string[]) {
    super(
      `Round ${roundNumber} missing results for players ${playerIds}. A result must be recorded for every player before moving to next round.`
    );
  }
}
