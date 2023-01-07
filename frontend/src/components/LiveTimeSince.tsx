import React from 'react';
import { useCallback } from 'react';
import { LiveText } from 'src/components/LiveText';
import { findClosestUnit, hoursMinutesSecondsSince } from 'src/utils/time';

export function LiveTimeSince({ date }: { date: Date }) {
  const makeTimeText = useCallback(
    () => hoursMinutesSecondsSince(date),
    [date]
  );
  const nextTickDelay = useCallback(() => {
    const elapsed = Math.abs(new Date().valueOf() - date.valueOf());
    return findClosestUnit(elapsed)[1];
  }, [date]);

  return <LiveText generateText={makeTimeText} nextTickDelay={() => 1000} />;
}
