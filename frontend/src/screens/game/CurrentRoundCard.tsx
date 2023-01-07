import { Box, BoxProps, Text, Tag } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { PlayingCard } from '../../components/PlayingCard';
import { GameAugmented } from '../../services/game';
import { ALL_SUITS, CardRankNumber } from '../../utils/card';
import { useWindowResizeCallback } from '../../utils/hooks/useWindowResizeCallback';
import { roundRankName } from './Game';

export type CurrentRoundCardState = { suitIdx: number };
export function useCurrentRoundCardState(): CurrentRoundCardState {
  const [suitIdx, setSuitIdx] = useState(0);
  useEffect(() => {
    const changeSuit = () => {
      if (document.hasFocus()) {
        setSuitIdx((cur) => (cur + 1) % ALL_SUITS.length);
      }
    };
    const timerId = setInterval(changeSuit, 3000);
    return () => clearTimeout(timerId);
  }, []);
  return { suitIdx };
}

export function CurrentRoundCard({
  game,
  state,
  className,
  ...boxProps
}: { game: GameAugmented; state: CurrentRoundCardState } & BoxProps) {
  const cardDiv = useRef<HTMLDivElement>(null);
  const round = game?.currentRoundObj;
  const [height, setHeight] = useState(boxProps.height || 0);

  const setDivHeight = useCallback(() => {
    if (cardDiv?.current?.offsetHeight) {
      setHeight(cardDiv?.current?.offsetHeight);
    }
  }, []);

  useWindowResizeCallback(setDivHeight);
  useEffect(setDivHeight, [setDivHeight, cardDiv?.current?.offsetHeight]);

  if (!round) {
    return null;
  }

  return (
    <>
      <Tag size="lg" mb={3} display="flex" flexDirection="row">
        {game.endedAt ? (
          <>
            <IoCheckmarkCircle /> <Text ml={1}>Game Finished</Text>
          </>
        ) : (
          `${roundRankName(round, true)} are wild`
        )}
      </Tag>
      <Box
        className={'current-card-container ' + (className || '')}
        {...boxProps}
        height={`${height}px`}
        background="white"
        borderRadius={15}
      >
        {ALL_SUITS.map((suit, idx) => (
          <Box
            key={idx}
            className={`current-card ${idx === state.suitIdx ? 'active' : ''}`}
            ref={cardDiv}
          >
            <PlayingCard suit={suit} rank={round.cardRank as CardRankNumber} />
          </Box>
        ))}
      </Box>
    </>
  );
}
