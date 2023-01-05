export type CardSuit = 'diamonds' | 'clubs' | 'hearts' | 'spades';
export const ALL_SUITS: CardSuit[] = ['diamonds', 'clubs', 'hearts', 'spades'];

const RANK_NAMES = {
  1: { singular: 'Ace', plural: 'Aces' },
  2: { singular: 'Two', plural: 'Twos' },
  3: { singular: 'Three', plural: 'Threes' },
  4: { singular: 'Four', plural: 'Fours' },
  5: { singular: 'Five', plural: 'Fives' },
  6: { singular: 'Six', plural: 'Sixes' },
  7: { singular: 'Seven', plural: 'Sevens' },
  8: { singular: 'Eight', plural: 'Eights' },
  9: { singular: 'Nine', plural: 'Nines' },
  10: { singular: 'Ten', plural: 'Tens' },
  11: { singular: 'Jack', plural: 'Jacks' },
  12: { singular: 'Queen', plural: 'Queens' },
  13: { singular: 'King', plural: 'Kings' },
};
export type CardRankNumber = keyof typeof RANK_NAMES;
export const ALL_RANKS = Object.keys(RANK_NAMES).map((n) => parseInt(n)) as CardRankNumber[];

export function cardRankName(
  rank: CardRankNumber,
  plural = false
): string | undefined {
  const name = RANK_NAMES[rank];
  if (name) {
    return plural ? name.plural : name.singular;
  }
}

export function cardRankShortName(rank: CardRankNumber): string {
  return (
    {
      1: 'A',
      11: 'J',
      12: 'Q',
      13: 'K',
    }[rank] || String(rank)
  );
}
