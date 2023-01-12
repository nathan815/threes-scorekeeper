import {
  Box,
  BoxProps,
  Text,
  Tag,
  HStack,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IoCheckmarkCircle, IoTime } from 'react-icons/io5';
import { LiveTimeSince } from 'src/components/LiveTimeSince';
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
  outerContainerProps = {},
  cardContainerProps = {},
  infoContainerProps: tagContainerProps = {},
}: {
  game: GameAugmented;
  state: CurrentRoundCardState;
  outerContainerProps?: BoxProps;
  cardContainerProps?: BoxProps;
  infoContainerProps?: BoxProps;
}) {
  const cardDiv = useRef<HTMLDivElement>(null);
  const round = game?.currentRoundObj;
  const [height, setHeight] = useState(cardContainerProps.height || 0);
  const opacity = useColorModeValue(1, 0.9);

  const setDivHeight = useCallback(() => {
    if (cardDiv?.current?.offsetHeight) {
      setHeight(cardDiv?.current?.offsetHeight);
    }
  }, []);

  useWindowResizeCallback(setDivHeight);
  useEffect(setDivHeight, [setDivHeight, cardDiv?.current?.offsetHeight]);

  const roundStartTime = game?.currentRoundObj?.startedAt;

  if (!round) {
    return null;
  }

  return (
    <Flex
      width="full"
      direction="column"
      alignItems="center"
      {...outerContainerProps}
    >
      <HStack mb={3} flexWrap="wrap" {...tagContainerProps}>
        <Tag size="lg" display="flex" flexDirection="row">
          {game.endedAt ? (
            <>
              <IoCheckmarkCircle /> <Text ml={1}>Game Finished</Text>
            </>
          ) : (
            `${roundRankName(round, true)} are wild`
          )}
        </Tag>

        {!game.endedAt && roundStartTime && (
          <Tag
            size="lg"
            display="flex"
            flexDirection="row"
            fontFamily="Monaco, Consolas, monospace"
            title={`Round started ${roundStartTime.toLocaleString()}`}
          >
            <IoTime />{' '}
            <Text ml={1}>
              <LiveTimeSince date={roundStartTime} />
            </Text>
          </Tag>
        )}
      </HStack>
      <Box
        {...cardContainerProps}
        className={
          'current-card-container ' + (cardContainerProps.className || '')
        }
        opacity={opacity}
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
    </Flex>
  );
}
