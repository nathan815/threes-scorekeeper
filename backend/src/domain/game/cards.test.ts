import { ALL_CARDS, Card, Deck, CardRankName, Suit } from './cards';

describe(Deck, () => {
  it('is initialized with 52 cards', () => {
    const d = new Deck();
    expect(d.cards.length).toBe(52);
    expect(d.cards[0]).toEqual(new Card(Suit.Clubs, 1));
    expect(d.cards[51]).toEqual(new Card(Suit.Spades, 13));
  });

  describe(Deck.prototype.shuffle, () => {
    beforeEach(() => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
    });

    afterEach(() => {
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('shuffles the cards', () => {
      const d = new Deck();
      expect(d.cards[0]).toEqual(new Card(Suit.Clubs, 1));
      expect(d.cards[47]).toEqual(new Card(Suit.Spades, 9));
      expect(d.cards[51]).toEqual(new Card(Suit.Spades, 13));
      d.shuffle();
      expect(d.cards[0]).not.toEqual(new Card(Suit.Clubs, 1));
      expect(d.cards[47]).not.toEqual(new Card(Suit.Spades, 9));
      expect(d.cards[51]).not.toEqual(new Card(Suit.Spades, 13));
    });
  });

  describe(Deck.prototype.draw, () => {
    it('draws top card on deck', () => {
      const d = new Deck();
      expect(d.draw()).toEqual(new Card(Suit.Spades, 13));
      expect(d.draw()).toEqual(new Card(Suit.Spades, 12));
      expect(d.draw()).toEqual(new Card(Suit.Spades, 11));
      expect(d.draw()).toEqual(new Card(Suit.Spades, 10));

      for (let i = 0; i < 15; i++) {
        d.draw();
      }

      expect(d.draw()).toEqual(new Card(Suit.Hearts, 7));
      expect(d.draw()).toEqual(new Card(Suit.Hearts, 6));
    });

    it('returns undefined when there are no more cards', () => {
      const d = new Deck();

      expect(d.draw()).toEqual(new Card(Suit.Spades, 13));

      while (d.cards.length > 0) {
        d.draw();
      }

      expect(d.draw()).toBeUndefined();
    });
  });
});

describe(Card, () => {
  describe('name', () => {
    it('returns correct rank name if exists', () => {
      expect(new Card(Suit.Hearts, 1).name).toEqual(CardRankName.Ace);
      expect(new Card(Suit.Hearts, 4).name).toBeNull();
      expect(new Card(Suit.Hearts, 11).name).toBe(CardRankName.Jack);
      expect(new Card(Suit.Hearts, 12).name).toBe(CardRankName.Queen);
      expect(new Card(Suit.Hearts, 13).name).toBe(CardRankName.King);
      expect(new Card(Suit.Spades, 1).name).toBe(CardRankName.Ace);
      expect(new Card(Suit.Spades, 5).name).toBeNull();
      expect(new Card(Suit.Clubs, 5).name).toBeNull();
      expect(new Card(Suit.Diamonds, 5).name).toBeNull();
      expect(new Card(Suit.Diamonds, 12).name).toBe(CardRankName.Queen);
    });
  });
});

describe('ALL_CARDS', () => {
  it('has 52 cards', () => {
    expect(ALL_CARDS.length).toBe(52);
  });
});
