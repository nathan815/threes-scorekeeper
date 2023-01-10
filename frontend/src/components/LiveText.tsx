import { TextProps } from '@chakra-ui/react';
import React, { useRef, useEffect } from 'react';

/**
 * Renders text on provided tick interval without triggering any re-renders.
 */
export function LiveText({
  generateText,
  nextTickDelay,
  ...props
}: {
  generateText: () => string;
  nextTickDelay: () => number;
} & React.HTMLProps<HTMLSpanElement>) {
  const ele = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>();

  useEffect(() => {
    const tick = () => {
      if (ele.current) {
        ele.current.innerText = generateText();
      }
    };
    const schedule = () => {
      tick();
      // console.log('nextTickDelay', nextTickDelay());
      clearTimeout(timer.current);
      timer.current = window.setTimeout(schedule, nextTickDelay());
    };

    tick();
    schedule();
    return () => clearTimeout(timer.current);
  }, [generateText, nextTickDelay]);

  return <span ref={ele} {...props}></span>;
}
