import { User } from '../user/user';
import { CardRank, CardRankName } from './cards';
import { Game, GameStage } from './game';

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

  it('is created with id join code', () => {
    const g = new Game(userA);
    expect(g.joinCode.trim()).not.toEqual('');
    expect(g.joinCode.trim().length).toBe(6);
    expect(g.joinCode).toBe(g.joinCode.toUpperCase());
  });

  describe('end-to-end game usage', () => {
    const g = new Game(userA);
    g.addPlayer(userB);
    g.start();

    expect(g.currentRound?.cardRank).toBe(CardRank.of(2));

    g.finishRound;
  });

  describe(Game.prototype.addPlayer, () => {
    it('adds player user objects and returns true', () => {
      const g = new Game(userA);
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
      const g = new Game(userA);
      for (let i = 0; i < 10; i++) {
        g.addPlayer(new User({ id: String(i), displayName: String(i) }));
      }

      expect(g.players.length).toBe(8);

      expect(g.addPlayer(userB)).toBe(false);

      expect(g.players.length).toBe(8);
    });

    it('prevents adding same player twice', () => {
      const g = new Game(userA);
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
      const g = new Game(userA);
      g.addPlayer(userB);
      g.start();

      expect(g.stage).toBe(GameStage.InProgress);
      expect(g.startedAt).not.toBeUndefined();
      expect(g.currentRound).not.toBeUndefined();
      expect(g.currentRound?.cardRank).toEqual(CardRank.ACE);
      expect(g.currentRound?.startedAt).toBeTruthy();
    });

    it('throws if there are not at least 2 players', () => {
      const g = new Game(userA);
      expect(() => {
        g.start();
      }).toThrow('Cannot start game unless there are 2 or more players');
      expect(g.stage).toBe(GameStage.Pre);
    });

    it('throws if game is already started or finished', () => {
      const g = new Game(userA);
      g.addPlayer(userB);
      g.start();

      expect(() => {
        g.start();
      }).toThrow('Cannot start game in this stage');
    });
  });

  describe(Game.prototype.nextRound, () => {
    it('moves to next card rank round', () => {
      const g = new Game(userA);
      g.addPlayer(userB);
      g.start();

      expect(g.currentRound?.cardRank).toEqual(CardRank.ACE);
      expect(g.currentRound?.cardRank?.number).toBe(1);

      g.finishRound({});

      g.nextRound();

      expect(g.currentRound?.cardRank?.number).toBe(2);

      g.finishRound({});

      g.nextRound();

      expect(g.currentRound?.cardRank?.number).toBe(3);
    });

    it('throws if current round is not finished', () => {
      const g = new Game(userA);
      g.addPlayer(userB);
      g.start();

      expect(() => {
        g.nextRound();
      }).toThrow('Current round is not finished');
    });

    it('throws if game is not in progress', () => {
      const g = new Game(userA);
      expect(() => {
        g.nextRound();
      }).toThrow('Game must be in progress');
    });
  });

  describe(Game.prototype.finish, () => {
    it('finishes the game', () => {
      const g = new Game(userA);
      g.addPlayer(userB);
      g.start();

      expect(g.stage).toBe(GameStage.InProgress);

      g.finish();

      expect(g.stage).toBe(GameStage.Done);
    });
  });

  describe(Game.prototype.finishRound, () => {
    it('throws if provided player is not in game', () => {
      const g = new Game(userA);
      g.addPlayer(userB);
      g.start();

      expect(() => {
        g.finishRound({
          [userA.id]: 5,
          xyz: 10,
        });
      }).toThrow('User ID xyz not in this game');
    });

    it('throws if no round', () => {
      const g = new Game(userA);
      g.addPlayer(userB);

      expect(() => {
        g.finishRound({});
      }).toThrow('No round in progress');
    });

    it('throws if round is finished', () => {
      const g = new Game(userA);
      g.addPlayer(userB);
      g.start();
      g.finishRound({});

      expect(() => {
        g.finishRound({});
      }).toThrow('Round is already finished');
    });
  });
});
