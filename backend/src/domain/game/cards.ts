export enum Suit {
  Clubs = 'Clubs',
  Diamonds = 'Diamonds',
  Hearts = 'Hearts',
  Spades = 'Spades',
}

export enum CardRankName {
  Ace = 'Ace',
  Jack = 'Jack',
  Queen = 'Queen',
  King = 'King',
}

const rankNumberToName: { [key: number]: CardRankName } = {
  1: CardRankName.Ace,
  11: CardRankName.Jack,
  12: CardRankName.Queen,
  13: CardRankName.King,
};
const rankNameToNumber: { [key in keyof typeof CardRankName]: number } = {
  [CardRankName.Ace]: 1,
  [CardRankName.Jack]: 11,
  [CardRankName.Queen]: 12,
  [CardRankName.King]: 13,
};

export class CardRank {
  constructor(public readonly number: number) {}

  get name(): CardRankName | null {
    return rankNumberToName[this.number] || null;
  }

  static of(rank: CardRankName | number) {
    if (typeof rank == 'number') {
      return new CardRank(rank);
    }
    return new CardRank(rankNameToNumber[rank]);
  }

  static ACE = CardRank.of(CardRankName.Ace);
  static JACK = CardRank.of(CardRankName.Jack);
  static QUEEN = CardRank.of(CardRankName.Queen);
  static KING = CardRank.of(CardRankName.King);
}

export class Card {
  constructor(public readonly suit: Suit, public readonly rank: number) {}

  get name(): CardRankName | null {
    return rankNumberToName[this.rank] || null;
  }
}

function makeCards() {
  const cards = [];
  for (const suit in Suit) {
    for (let i = 1; i <= 13; i++) {
      cards.push(new Card(Suit[suit as keyof typeof Suit], i));
    }
  }
  return cards;
}
export const ALL_CARDS: readonly Card[] = Object.freeze(makeCards());

export class Deck {
  cards: Card[] = Array.from(ALL_CARDS);

  shuffle() {
    const n = this.cards.length;
    for (let i = 0; i < n; i++) {
      const k = Math.round(Math.random() * i) + n;
      const temp = this.cards[i];
      this.cards[i] = this.cards[k];
      this.cards[k] = temp;
    }
  }

  draw(): Card | undefined {
    return this.cards.pop();
  }
}
