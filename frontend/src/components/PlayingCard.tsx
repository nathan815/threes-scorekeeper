import { Box, BoxProps } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import React, { useCallback, useRef, useState } from 'react';
import { IconType } from 'react-icons';
import {
  BsSuitClubFill,
  BsSuitDiamondFill,
  BsSuitHeartFill,
  BsSuitSpadeFill,
} from 'react-icons/bs';
import {
  cardRankName,
  CardRankNumber,
  cardRankShortName,
  CardSuit,
} from '../utils/card';
import { useWindowResizeCallback } from '../utils/hooks/useWindowResizeCallback';
import * as styles from './PlayingCard.css';

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

  const [fontSize, setFontSize] = useState(0);

  useWindowResizeCallback(
    useCallback(() => {
      const width = cardDiv?.current?.offsetWidth || 0;
      if (width) {
        setFontSize(width / 2);
      }
    }, [cardDiv])
  );

  return (
    <Box className="playing-card-wrapper" width="100%" {...restProps}>
      <Global styles={css(styles)} />
      <Box
        className={`playing-card ${color}`}
        aria-label={`Playing Card: ${rankName} of ${suit}`}
        ref={cardDiv}
      >
        <div className="card-suit card-suit-1">
          <SuitIcon size="100%" />
        </div>
        <div className="card-rank" style={{ fontSize }}>
          {rankLetter}
        </div>
        <div className="card-suit card-suit-2">
          <SuitIcon size="100%" />
        </div>
      </Box>
    </Box>
  );
}
