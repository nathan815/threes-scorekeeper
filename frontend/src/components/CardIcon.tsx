import React from 'react';
import { IconBaseProps } from 'react-icons';
import {
  GiCardAceDiamonds,
  GiCard2Diamonds,
  GiCard3Diamonds,
  GiCard4Diamonds,
  GiCard5Diamonds,
  GiCard6Diamonds,
  GiCard7Diamonds,
  GiCard8Diamonds,
  GiCard9Diamonds,
  GiCard10Diamonds,
  GiCardJackDiamonds,
  GiCardQueenDiamonds,
  GiCardKingDiamonds,
  GiCardAceClubs,
  GiCard2Clubs,
  GiCard3Clubs,
  GiCard4Clubs,
  GiCard5Clubs,
  GiCard6Clubs,
  GiCard7Clubs,
  GiCard8Clubs,
  GiCard9Clubs,
  GiCard10Clubs,
  GiCardJackClubs,
  GiCardQueenClubs,
  GiCardKingClubs,
  GiCardAceHearts,
  GiCard2Hearts,
  GiCard3Hearts,
  GiCard4Hearts,
  GiCard5Hearts,
  GiCard6Hearts,
  GiCard7Hearts,
  GiCard8Hearts,
  GiCard9Hearts,
  GiCard10Hearts,
  GiCardJackHearts,
  GiCardQueenHearts,
  GiCardKingHearts,
  GiCardAceSpades,
  GiCard2Spades,
  GiCard3Spades,
  GiCard4Spades,
  GiCard5Spades,
  GiCard6Spades,
  GiCard7Spades,
  GiCard8Spades,
  GiCard9Spades,
  GiCard10Spades,
  GiCardJackSpades,
  GiCardQueenSpades,
  GiCardKingSpades,
} from 'react-icons/gi';

const cards = {
  diamonds: {
    1: GiCardAceDiamonds,
    2: GiCard2Diamonds,
    3: GiCard3Diamonds,
    4: GiCard4Diamonds,
    5: GiCard5Diamonds,
    6: GiCard6Diamonds,
    7: GiCard7Diamonds,
    8: GiCard8Diamonds,
    9: GiCard9Diamonds,
    10: GiCard10Diamonds,
    11: GiCardJackDiamonds,
    12: GiCardQueenDiamonds,
    13: GiCardKingDiamonds,
  },
  clubs: {
    1: GiCardAceClubs,
    2: GiCard2Clubs,
    3: GiCard3Clubs,
    4: GiCard4Clubs,
    5: GiCard5Clubs,
    6: GiCard6Clubs,
    7: GiCard7Clubs,
    8: GiCard8Clubs,
    9: GiCard9Clubs,
    10: GiCard10Clubs,
    11: GiCardJackClubs,
    12: GiCardQueenClubs,
    13: GiCardKingClubs,
  },
  hearts: {
    1: GiCardAceHearts,
    2: GiCard2Hearts,
    3: GiCard3Hearts,
    4: GiCard4Hearts,
    5: GiCard5Hearts,
    6: GiCard6Hearts,
    7: GiCard7Hearts,
    8: GiCard8Hearts,
    9: GiCard9Hearts,
    10: GiCard10Hearts,
    11: GiCardJackHearts,
    12: GiCardQueenHearts,
    13: GiCardKingHearts,
  },
  spades: {
    1: GiCardAceSpades,
    2: GiCard2Spades,
    3: GiCard3Spades,
    4: GiCard4Spades,
    5: GiCard5Spades,
    6: GiCard6Spades,
    7: GiCard7Spades,
    8: GiCard8Spades,
    9: GiCard9Spades,
    10: GiCard10Spades,
    11: GiCardJackSpades,
    12: GiCardQueenSpades,
    13: GiCardKingSpades,
  },
};

export type CardSuit = keyof typeof cards;

export const ALL_SUITS: CardSuit[] = ['clubs', 'hearts', 'spades', 'diamonds'];

interface CardIconProps {
  rank: number;
  suit: CardSuit;
}

export function CardIcon({
  rank,
  suit,
  ...iconProps
}: CardIconProps & IconBaseProps) {
  const Icon = cards[suit][rank];
  if (!Icon) {
    return null;
  }
  return <Icon {...iconProps} />;
}
