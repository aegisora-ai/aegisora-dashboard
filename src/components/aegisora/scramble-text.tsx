'use client';

import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

type Props = {
  text: string;
  className?: string;
  tickMs?: number;
  staggerTicks?: number;
  lockTicks?: number;
};

export function ScrambleText({ text, className, tickMs = 18, staggerTicks = 1.1, lockTicks = 3 }: Props) {
  const [display, setDisplay] = useState(text);
  const runId = useRef(0);

  useEffect(() => {
    const myRun = ++runId.current;
    let frame = 0;
    const maxFrames = Math.ceil(text.length * staggerTicks + lockTicks) + 4;

    const id = setInterval(() => {
      if (runId.current !== myRun) {
        clearInterval(id);
        return;
      }
      frame += 1;

      let finished = true;
      const chars = text.split('').map((ch, i) => {
        if (ch === ' ' || ch === '\n') return ch;
        const lockFrame = i * staggerTicks + lockTicks;
        if (frame >= lockFrame) return ch;
        finished = false;
        return CHARS[(Math.random() * CHARS.length) | 0];
      });

      setDisplay(chars.join(''));

      if (finished || frame >= maxFrames) {
        setDisplay(text);
        clearInterval(id);
      }
    }, tickMs);

    // Guvenlik agi: her ne olursa olsun en gec ~1.2sn sonra gercek metne kilitle
    const safety = setTimeout(() => {
      if (runId.current === myRun) setDisplay(text);
    }, tickMs * maxFrames + 300);

    return () => {
      clearInterval(id);
      clearTimeout(safety);
    };
  }, [text, tickMs, staggerTicks, lockTicks]);

  return (
    <span className={className} role="text" aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}