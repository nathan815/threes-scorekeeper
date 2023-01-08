import React from 'react';
import { useCallback } from 'react';
import { LiveText } from 'src/components/LiveText';
import { hoursMinutesSecondsSince } from 'src/utils/time';

export function LiveTimeSince({ date }: { date: Date }) {
  const makeTimeText = useCallback(
    () => hoursMinutesSecondsSince(date),
    [date]
  );

  return <LiveText generateText={makeTimeText} nextTickDelay={() => 1000} />;
}
