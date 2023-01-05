import { Box, BoxProps } from '@chakra-ui/react';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { IconType } from 'react-icons';
import {
  BsSuitClubFill,
  BsSuitDiamondFill,
  BsSuitHeartFill,
  BsSuitSpadeFill
} from 'react-icons/bs';
import {
  cardRankName,
  CardRankNumber,
  cardRankShortName,
  CardSuit
} from '../utils/card';
import './PlayingCard.css';

const suits: { [key in CardSuit]: [IconType, string] } = {
  hearts: [BsSuitHeartFill, 'red'],
  diamonds: [BsSuitDiamondFill, 'red'],
  clubs: [BsSuitClubFill, 'black'],
  spades: [BsSuitSpadeFill, 'black'],
};

interface PlayingCardProps {
  suit: CardSuit;
  rank: CardRankNumber;
}

export function PlayingCard(props: PlayingCardProps & BoxProps) {
  const { suit, rank, ...restProps } = props;
  const rankName = cardRankName(rank);
  const rankLetter = cardRankShortName(rank);
  const cardDiv = useRef<HTMLDivElement>(null);

  const [SuitIcon, color] = suits[suit];

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = debounce(() => {
      if (cardDiv?.current?.offsetWidth) {
        setWidth(cardDiv?.current?.offsetWidth);
      }
    }, 100);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('reisze', updateWidth);
  }, []);

  return (
    <Box
      background="white"
      width="100%"
      className={`playing-card ${color}`}
      title={`Playing Card: ${rankName} of ${suit}`}
      ref={cardDiv}
      {...restProps}
    >
      <div className="card-suit card-suit-1">
        <SuitIcon size="5.5em" />
      </div>
      <div className="card-rank" style={{ fontSize: width / 1.8 }}>
        {rankLetter}
      </div>
      <div className="card-suit card-suit-2">
        <SuitIcon size="5.5em" />
      </div>
    </Box>
  );
}
