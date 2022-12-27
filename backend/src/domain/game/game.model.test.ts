import { User } from '../user/user.model';
import { CardRank, CardRankName } from './cards';
import { Game, GameStage, PlayerRoundPoints } from './game.model';

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
    const g = new Game("test", userA);
    expect(g.shortId.trim()).not.toEqual('');
    expect(g.shortId.trim().length).toBe(6);
    expect(g.shortId).toBe(g.shortId.toUpperCase());

    expect(userA).not.toBeUndefined();
    expect(userB).not.toBeUndefined();
    expect(userC).not.toBeUndefined();
  });

  it('runs end-to-end', () => {
    const g = new Game("test", userA);
    g.addPlayer(userB);
    g.start();

    expect(g.currentRound?.cardRank).toEqual(CardRank.of(CardRankName.Ace));

    g.finishRound([
      new PlayerRoundPoints(userA, 0),
      new PlayerRoundPoints(userB, 10),
    ]);
  });

  describe(Game.prototype.addPlayer, () => {
    it('adds player user objects and returns true', () => {
      const g = new Game("test", userA);
      expect(g.players.length).toBe(1);

      expect(g.addPlayer(userB)).toBe(true);
      expect(g.players.length).toBe(2);

      expect(g.addPlayer(userC)).toBe(true);
      expect(g.players.length).toBe(3);

      expect(g.players[0]).toBe(userA);
      expect(g.players[1]).toBe(userB);
      expect(g.players[2]).toBe(userC);
    });

    it('prevents adding more than allowed number of players', () => {
      const g = new Game("test", userA);
      for (let i = 0; i < 10; i++) {
        g.addPlayer(new User({ id: String(i), displayName: String(i) }));
      }

      expect(g.players.length).toBe(8);

      expect(g.addPlayer(userB)).toBe(false);

      expect(g.players.length).toBe(8);
    });

    it('prevents adding same player twice', () => {
      const g = new Game("test", userA);
      expect(g.players.length).toBe(1);

      expect(g.addPlayer(userA)).toBe(false);
      expect(g.players.length).toBe(1);

      expect(g.addPlayer(userB)).toBe(true);
      expect(g.addPlayer(userB)).toBe(false);
      expect(g.addPlayer(userB)).toBe(false);
      expect(g.players.length).toBe(2);
    });
  });

  describe(Game.prototype.start, () => {
    it('starts game with first round as Ace', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      expect(g.stage).toBe(GameStage.InProgress);
      expect(g.startedAt).not.toBeUndefined();
      expect(g.currentRound).not.toBeUndefined();
      expect(g.currentRound?.cardRank).toEqual(CardRank.ACE);
      expect(g.currentRound?.startedAt).toBeTruthy();
    });

    it('throws if there are not at least 2 players', () => {
      const g = new Game("test", userA);
      expect(() => {
        g.start();
      }).toThrow('Cannot start game unless there are 2 or more players');
      expect(g.stage).toBe(GameStage.Pre);
    });

    it('throws if game is already started or finished', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      expect(() => {
        g.start();
      }).toThrow('Cannot start game in this stage');
    });
  });

  describe(Game.prototype.nextRound, () => {
    it('moves to next card rank round', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      expect(g.currentRound?.cardRank).toEqual(CardRank.ACE);
      expect(g.currentRound?.cardRank?.number).toBe(1);

      g.finishRound([
        new PlayerRoundPoints(userA, 0),
        new PlayerRoundPoints(userB, 0),
      ]);

      g.nextRound();

      expect(g.currentRound?.cardRank?.number).toBe(2);

      g.finishRound([
        new PlayerRoundPoints(userA, 0),
        new PlayerRoundPoints(userB, 0),
      ]);

      g.nextRound();

      expect(g.currentRound?.cardRank?.number).toBe(3);
    });

    it('throws if current round is not finished', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      expect(() => {
        g.nextRound();
      }).toThrow('Current round is not finished');
    });

    it('throws if game is not in progress', () => {
      const g = new Game("test", userA);
      expect(() => {
        g.nextRound();
      }).toThrow('Game must be in progress');
    });
  });

  describe(Game.prototype.finish, () => {
    it('finishes the game', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      expect(g.stage).toBe(GameStage.InProgress);

      g.finish();

      expect(g.stage).toBe(GameStage.Done);
    });
  });

  describe(Game.prototype.finishRound, () => {
    it('throws if provided player is not in game', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      expect(() => {
        g.finishRound([
          new PlayerRoundPoints(userA, 0),
          new PlayerRoundPoints(userB, 0),
          new PlayerRoundPoints(userC, 0),
        ]);
      }).toThrow(`No player with ID ${userC.id} in this game`);
    });

    it('throws if points no provided for a player', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      expect(() => {
        g.finishRound([
          new PlayerRoundPoints(userA, 0),
        ]);
      }).toThrow(`Points not provided for player ID ${userB.id}`);
    });

    it('throws if no round', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);

      expect(() => {
        g.finishRound([
          new PlayerRoundPoints(userA, 0),
          new PlayerRoundPoints(userB, 0),
        ]);
      }).toThrow('No round in progress');
    });

    it('throws if round is finished', () => {
      const g = new Game("test", userA);
      g.addPlayer(userB);
      g.start();

      const points = [
        new PlayerRoundPoints(userA, 0),
        new PlayerRoundPoints(userB, 0),
      ];

      g.finishRound(points);

      expect(() => {
        g.finishRound(points);
      }).toThrow('Round is already finished');
    });
  });
});
