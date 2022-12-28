import { CardRank } from './cards';
import { User } from '../user/user.model';
import { generateShortId } from '../../utils/generateShortId';

const MAX_PLAYERS = 8;
const TOTAL_ROUNDS = 13;
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

  get totalPointsByPlayer(): { [userId: string]: number } {
    console.log('enter totalPointsByPlayer', 'rounds', this.rounds);
    const totals: { [userId: string]: number } = {};
    for (const player of this.players) {
      totals[player.id] =
        (totals[player.id] || 0) + this.getPlayerPoints(player);
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
      throw new GameError(`Invalid player user object: ${player}`);
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
      throw new GameError(`Maximum of ${MAX_PLAYERS} players reached`);
    }
    this.players.push(player);
    return true;
  }

  getPlayerPoints(player: User): number {
    return this.rounds
      .map((round) => {
        const result = round.playerResults[player.id];
        if (result) {
          const bonus = result.cutDeckPerfectly ? PERFECT_DECK_CUT_BONUS : 0;
          return result.cardPoints + bonus;
        }
        return 0;
      })
      .reduce((prev, cur) => prev + cur, 0);
  }

  start(startedBy: User) {
    if (startedBy.id != this.owner!.id) {
      throw new NonOwnerCannotStartGameError();
    }

    if (this.stage != GameStage.Pre) {
      throw new GameError('Cannot start game in this stage: ' + this.stage);
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
      cutDeckPerfectly,
    });
  }

  nextRound() {
    if (this.stage != GameStage.InProgress) {
      throw new IllegalGameStageError(
        `Game must be in stage ${GameStage.InProgress} to go to next round.`
      );
    }

    this.finishCurrentRound();

    if (this.rounds.length == TOTAL_ROUNDS) {
      this.finish();
      return;
    }

    const curRankNum = this.currentRound?.cardRank.number ?? 0;
    const nextRank = CardRank.of(curRankNum + 1);
    const round = new GameRound(nextRank);
    this.rounds.push(round);
    console.log('new round', round, 'ROUNDS', this.rounds);
  }

  private finishCurrentRound() {
    const currentRound = this.currentRound;
    // console.log('currentRound', currentRound);
    if (!currentRound) {
      return;
    }
    if (currentRound.isFinished) {
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
  cutDeckPerfectly: boolean;
}

export class GameError extends Error {
  constructor(msg: string) {
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
