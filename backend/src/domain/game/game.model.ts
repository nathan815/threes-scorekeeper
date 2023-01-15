import { generateShortId } from '../../utils/generateShortId';
import { PseudoUser, User } from '../user/user.model';
import { CardRank } from './cards';

const MAX_PLAYERS = 8;
const START_ROUND_CARD = 3;
const END_ROUND_CARD = 13;
const PERFECT_DECK_CUT_BONUS = -20;

export enum GameStage {
  Pre = 'Pre',
  InProgress = 'InProgress',
  Done = 'Done',
}

export interface Player {
  id: string;
  displayName?: string;
  gravatarHash: string;
  isPseudo?: boolean;
}

export class Game {
  id!: string;
  stage: GameStage = GameStage.Pre;
  userPlayers: User[] = [];
  pseudoPlayers: PseudoUser[] = [];
  rounds: GameRound[] = [];
  startedAt?: Date;
  endedAt?: Date;

  constructor(
    public name: string,
    public owner: User,
    public shortId: string = generateShortId()
  ) {
    if (owner) {
      this.addUserPlayer(owner);
    }
  }

  get players(): Player[] {
    return [
      ...this.userPlayers.map(({ id, displayName, gravatarHash }) => ({
        id,
        displayName,
        gravatarHash,
      })),
      ...this.pseudoPlayers.map(({ id, displayName, gravatarHash }) => ({
        id,
        displayName,
        gravatarHash,
        isPseudo: true,
      })),
    ];
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
    for (const { id } of this.players) {
      totals[id] =
        (totals[id] || 0) + this.getPlayerPoints(id, includeUnfinished);
    }
    return totals;
  }

  /**
   * The current winner (player with least amount of points) once there is at least one finished
   * Multiple players will be returned when there is a tie.
   * */
  get currentWinners(): Player[] {
    if (this.stage == GameStage.Pre || this.rounds.length <= 1) {
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

  changeOwner(newOwnerId: string) {
    if (newOwnerId === this.owner.id) {
      return false;
    }
    const user = this.userPlayers.find((u) => u.id === newOwnerId);
    if (!user) {
      throw new GameError(`No user with ID '${newOwnerId}' is in this game.`);
    }
    this.owner = user;
    return true;
  }

  addUserPlayer(player: User): boolean {
    if (!(player instanceof User)) {
      throw new GameError(`Invalid player user object: ${player}`);
    }
    if (this.userPlayers.some((u) => u.id == player.id)) {
      return true;
    }
    this.addPlayerPrechecks();
    this.userPlayers.push(player);
    return true;
  }

  addPseudoPlayer(newPlayer: PseudoUser): boolean {
    if (!(newPlayer instanceof PseudoUser)) {
      throw new GameError(`Invalid player user object: ${newPlayer}`);
    }
    if (this.pseudoPlayers.some((u) => u.id == newPlayer.id)) {
      return true;
    }
    if (this.players.some((p) => p.displayName == newPlayer.displayName)) {
      throw new GameError(
        `Player with name '${newPlayer.displayName}' is already in this game`
      );
    }
    this.addPlayerPrechecks();
    this.pseudoPlayers.push(newPlayer);
    return true;
  }

  private addPlayerPrechecks() {
    if (this.stage != GameStage.Pre) {
      throw new IllegalGameStageError(
        `Cannot add players in stage ${this.stage}`
      );
    }
    if (this.players.length >= MAX_PLAYERS) {
      throw new GameError(`Maximum of ${MAX_PLAYERS} players reached`);
    }
  }

  getPlayerPoints(id: string, includeUnfinished = false): number {
    return this.rounds
      .filter((round) => includeUnfinished || round.isFinished)
      .map((round) => {
        const result = round.playerResults[id];
        return result
          ? (result.cardPoints || 0) + (result.perfectCutBonus || 0)
          : 0;
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
    // console.log('End of start - game =', this);
  }

  finish() {
    if (this.stage == GameStage.Done) {
      return;
    }

    this.endedAt = new Date();
    this.stage = GameStage.Done;
  }

  recordPlayerRoundResult(
    playerId: string,
    points: number,
    cutDeckPerfectly = false,
    roundNumber?: number
  ) {
    let round: GameRound;
    if (typeof roundNumber === 'undefined') {
      if (!this.currentRound) {
        throw new GameError('No round in progress');
      }
      round = this.currentRound;
    } else {
      if (roundNumber < START_ROUND_CARD || roundNumber > END_ROUND_CARD) {
        throw new GameError('Invalid round number provided', {
          roundNumber,
          startRound: START_ROUND_CARD,
          endRound: END_ROUND_CARD,
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

    if (!this.players.some((u) => u.id == playerId)) {
      throw new GameError(`No player with ID ${playerId} in this game`);
    }

    return round.recordPlayerResult({
      userId: playerId,
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

    if (this.currentRound?.cardRank.number === END_ROUND_CARD) {
      this.finish();
      return;
    }

    const curRank = this.currentRound?.cardRank.number;
    const nextRank = CardRank.of(curRank ? curRank + 1 : START_ROUND_CARD);
    const round = new GameRound(nextRank);
    this.rounds.push(round);
    // console.log('new round', round, 'ROUNDS', this.rounds);
  }

  finishCurrentRound() {
    const currentRound = this.currentRound;
    // console.log('currentRound', currentRound);
    if (!currentRound || currentRound.isFinished) {
      return;
    }
    const missingPlayerIds = this.players
      .map((player) => player.id)
      .filter((id) => !Object.hasOwn(currentRound.playerResults, id));

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
  perfectCutBonus?: number;
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
