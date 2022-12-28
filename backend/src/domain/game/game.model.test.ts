import { User } from '../user/user.model';
import { CardRank, CardRankName } from './cards';
import {
  Game,
  GameStage,
  IllegalGameStageError,
  NonOwnerCannotStartGameError,
  PlayerRoundResult,
  ResultNotRecordedForPlayersError,
} from './game.model';

describe(Game, () => {
  let userA: User;
  let userB: User;
  let userC: User;

  beforeEach(() => {
    userA = new User({
      id: '123',
      displayName: 'A',
    });
    userB = new User({
      id: '456',
      displayName: 'B',
    });
    userC = new User({
      id: '789',
      displayName: 'C',
    });
  });

  it('is created with short id', () => {
    const g = new Game('test', userA);
    expect(g.shortId.trim()).not.toEqual('');
    expect(g.shortId.trim().length).toBe(6);
    expect(g.shortId).toBe(g.shortId.toUpperCase());

    expect(userA).not.toBeUndefined();
    expect(userB).not.toBeUndefined();
    expect(userC).not.toBeUndefined();
  });

  it('runs correctly through full happy-path', () => {
    const g = new Game('e2e game test', userA);
    g.addPlayer(userB);
    expect(g.winningPlayer).toBeUndefined();

    g.start(userA);

    // Ace
    expect(g.currentRound?.cardRank).toEqual(CardRank.of(CardRankName.Ace));
    g.recordPlayerRoundResult(userA, 0);
    g.recordPlayerRoundResult(userB, 10);
    expect(g.currentRound?.cardRank).toEqual(CardRank.of(CardRankName.Ace));
    expect(g.getPlayerPoints(userA)).toBe(0);
    expect(g.getPlayerPoints(userB)).toBe(10);
    expect(g.winningPlayer).toEqual(userA);

    // 2
    g.nextRound();
    expect(g.currentRound?.cardRank).toEqual(CardRank.of(2));
    g.recordPlayerRoundResult(userA, 25);
    g.recordPlayerRoundResult(userB, 5);
    expect(g.getPlayerPoints(userA)).toBe(25);
    expect(g.getPlayerPoints(userB)).toBe(15);
    expect(g.winningPlayer).toEqual(userB);

    // 3
    g.nextRound();
    expect(g.currentRound?.cardRank).toEqual(CardRank.of(3));
    g.recordPlayerRoundResult(userA, 5);
    g.recordPlayerRoundResult(userB, 10);
    expect(g.getPlayerPoints(userA)).toBe(30);
    expect(g.getPlayerPoints(userB)).toBe(25);
    expect(g.winningPlayer).toEqual(userB);

    // 4
    g.nextRound();
    expect(g.currentRound?.cardRank).toEqual(CardRank.of(4));
    g.recordPlayerRoundResult(userA, 0);
    g.recordPlayerRoundResult(userB, 10);
    expect(g.getPlayerPoints(userA)).toBe(30);
    expect(g.getPlayerPoints(userB)).toBe(35);
    expect(g.winningPlayer).toEqual(userA);

    // 5
    g.nextRound();
    expect(g.currentRound?.cardRank).toEqual(CardRank.of(5));
    g.recordPlayerRoundResult(userA, 5);
    g.recordPlayerRoundResult(userB, 5);
    expect(g.getPlayerPoints(userA)).toBe(35);
    expect(g.getPlayerPoints(userB)).toBe(40);
    expect(g.winningPlayer).toEqual(userA);

    // 6
    g.nextRound();
    expect(g.currentRound?.cardRank).toEqual(CardRank.of(6));
    g.recordPlayerRoundResult(userA, 5, true); // user gets -20 bonus for cutting deck perfectly. effectively -15.
    g.recordPlayerRoundResult(userB, 8);
    expect(g.getPlayerPoints(userA)).toBe(20);
    expect(g.getPlayerPoints(userB)).toBe(48);
    expect(g.winningPlayer).toEqual(userA);
  });

  describe(Game.prototype.addPlayer, () => {
    it('adds player user objects and returns true', () => {
      const g = new Game('test', userA);
      expect(g.players.length).toBe(1);

      expect(g.addPlayer(userB)).toBe(true);
      expect(g.players.length).toBe(2);

      expect(g.addPlayer(userC)).toBe(true);
      expect(g.players.length).toBe(3);

      expect(g.players[0]).toBe(userA);
      expect(g.players[1]).toBe(userB);
      expect(g.players[2]).toBe(userC);
    });

    it('prevents adding players if game is already started', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      expect(() => g.addPlayer(userC)).toThrow(IllegalGameStageError); // fails for user not in game
      expect(() => g.addPlayer(userB)).toThrow(IllegalGameStageError); // also fails for users already in game
    });

    it('prevents adding more than allowed number of players', () => {
      const g = new Game('test', userA);
      for (let i = 0; i < 7; i++) {
        g.addPlayer(new User({ id: String(i), displayName: String(i) }));
      }

      expect(g.players.length).toBe(8);

      expect(g.addPlayer(userA)).toBe(true); // adding existing player is idempotent

      expect(() => g.addPlayer(userB)).toThrow('Maximum of 8 players reached');

      expect(g.players.length).toBe(8);
    });

    it('is idempotent (same player is only added once)', () => {
      const g = new Game('test', userA);
      expect(g.players.length).toBe(1);

      expect(g.addPlayer(userA)).toBe(true);
      expect(g.players.length).toBe(1);

      expect(g.addPlayer(userB)).toBe(true);
      expect(g.addPlayer(userB)).toBe(true);
      expect(g.addPlayer(userB)).toBe(true);
      expect(g.players.length).toBe(2);
    });
  });

  describe(Game.prototype.start, () => {
    it('starts game with first round as Ace', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      expect(g.stage).toBe(GameStage.InProgress);
      expect(g.startedAt).not.toBeUndefined();
      expect(g.currentRound).not.toBeUndefined();
      expect(g.currentRound?.cardRank).toEqual(CardRank.ACE);
      expect(g.currentRound?.startedAt).toBeTruthy();
    });

    it('throws if there are not at least 2 players', () => {
      const g = new Game('test', userA);
      expect(() => {
        g.start(userA);
      }).toThrow('Cannot start game unless there are 2 or more players');
      expect(g.stage).toBe(GameStage.Pre);
    });

    it('throws if game is already started or finished', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      expect(() => {
        g.start(userA);
      }).toThrow('Game has already been started');
    });

    it('throws if non-owner tries to start game', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      expect(() => g.start(userB)).toThrow(NonOwnerCannotStartGameError);
    });
  });

  describe(Game.prototype.nextRound, () => {
    it('moves to next card rank round', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      expect(g.currentRound?.cardRank).toEqual(CardRank.ACE);
      expect(g.currentRound?.cardRank?.number).toBe(1);

      g.recordPlayerRoundResult(userA, 0);
      g.recordPlayerRoundResult(userB, 0);

      g.nextRound();

      expect(g.currentRound?.cardRank?.number).toBe(2);

      g.recordPlayerRoundResult(userA, 0);
      g.recordPlayerRoundResult(userB, 0);

      g.nextRound();

      expect(g.currentRound?.cardRank?.number).toBe(3);
    });

    it('throws if no result was recorded for a player', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      g.recordPlayerRoundResult(userA, 0);
      expect(() => {
        g.nextRound();
      }).toThrow(ResultNotRecordedForPlayersError);
    });

    it('throws if game is not in progress', () => {
      const g = new Game('test', userA);
      expect(() => {
        g.nextRound();
      }).toThrow(IllegalGameStageError);
    });
  });

  describe(Game.prototype.finish, () => {
    it('finishes the game', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      expect(g.stage).toBe(GameStage.InProgress);

      g.finish();

      expect(g.stage).toBe(GameStage.Done);
    });
  });

  describe(Game.prototype.recordPlayerRoundResult, () => {
    it('records player result on current round when none specified', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      g.recordPlayerRoundResult(userA, 0);
      g.recordPlayerRoundResult(userB, 7);

      expect(g.currentRound?.playerResults[userA.id].cardPoints).toBe(0);
      expect(g.currentRound?.playerResults[userB.id].cardPoints).toBe(7);
    });

    it('records player result on specified round', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      g.recordPlayerRoundResult(userA, 3);
      g.recordPlayerRoundResult(userB, 5);
      expect(g.currentRound?.playerResults[userA.id].cardPoints).toBe(3);
      expect(g.currentRound?.playerResults[userB.id].cardPoints).toBe(5);

      g.nextRound();
      g.recordPlayerRoundResult(userA, 13);
      g.recordPlayerRoundResult(userB, 8);
      expect(g.currentRound?.playerResults[userA.id].cardPoints).toBe(13);
      expect(g.currentRound?.playerResults[userB.id].cardPoints).toBe(8);

      g.recordPlayerRoundResult(userB, 16, false, 1); // change userB round1 points to 16
      expect(g.rounds[0].playerResults[userA.id].cardPoints).toBe(3); // userA unchanged
      expect(g.rounds[0].playerResults[userB.id].cardPoints).toBe(16); // userB is now 16
    });

    it('throws if provided player is not in game', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);
      g.start(userA);

      g.recordPlayerRoundResult(userA, 0);
      g.recordPlayerRoundResult(userB, 10);

      expect(() => {
        g.recordPlayerRoundResult(userC, 15);
      }).toThrow(`No player with ID ${userC.id} in this game`);
    });

    it('throws if no round', () => {
      const g = new Game('test', userA);
      g.addPlayer(userB);

      expect(() => {
        g.recordPlayerRoundResult(userA, 0);
        g.recordPlayerRoundResult(userB, 0);
      }).toThrow('No round in progress');
    });
  });
});
