import React from 'react';
import { useCallback } from 'react';
import { LiveText } from 'src/components/LiveText';
import { findClosestUnit, getDurationText, UnitDisplay } from 'src/utils/time';

export function LiveTimeAgo({ date, unitDisplay = 'long' }: { date: Date, unitDisplay?: UnitDisplay }) {
  const makeTimeText = useCallback(
    () => getDurationText({ d1: date, unitDisplay }),
    [date, unitDisplay]
  );
  const nextTickDelay = useCallback(() => {
    const elapsed = Math.abs(new Date().valueOf() - date.valueOf());
    return findClosestUnit(elapsed)[1];
  }, [date]);

  return <LiveText generateText={makeTimeText} nextTickDelay={nextTickDelay} title={date.toLocaleString()} />;
}
