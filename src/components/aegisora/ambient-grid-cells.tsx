'use client';

import { useMemo } from 'react';

type Props = {
  cols?: number;
  rows?: number;
  count?: number;
  opacity?: number;
};

/**
 * Deterministic seeded PRNG so the layout is stable across server/client
 * render (no hydration mismatch) but still looks organic.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function AmbientGridCells({ cols = 20, rows = 10, count = 22, opacity = 0.3 }: Props) {
  const cells = useMemo(() => {
    const rand = mulberry32(cols * 1000 + rows * 37 + count);
    const total = cols * rows;

    // Evenly spread positions: bucket the grid into `count` regions and
    // place one cell per region, instead of pure random (which clusters).
    const picked = new Set<number>();
    const bucketSize = Math.max(1, Math.floor(total / count));
    for (let i = 0; i < count; i++) {
      const bucketStart = i * bucketSize;
      const bucketEnd = Math.min(total, bucketStart + bucketSize);
      if (bucketStart >= bucketEnd) continue;
      const idx = bucketStart + Math.floor(rand() * (bucketEnd - bucketStart));
      picked.add(idx);
    }

    return Array.from(picked).map((idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const delay = rand() * 6;
      const duration = 4 + rand() * 5;
      const cellOpacity = 0.4 + rand() * 0.6; // per-cell variance
      return { col, row, delay, duration, cellOpacity };
    });
  }, [cols, rows, count]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        // Fades cells out toward the center-left where hero copy sits,
        // and toward the very top/bottom edges, so nothing glows behind text.
        maskImage:
          'radial-gradient(120% 90% at 22% 45%, transparent 0%, transparent 28%, black 62%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        maskComposite: 'intersect',
        WebkitMaskImage:
          'radial-gradient(120% 90% at 22% 45%, transparent 0%, transparent 28%, black 62%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskComposite: 'source-in',
      }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {cells.map((cell, i) => (
          <span
            key={i}
            className="aeg-ambient-cell rounded-[2px] bg-primary"
            style={{
              gridColumnStart: cell.col + 1,
              gridRowStart: cell.row + 1,
              opacity: opacity * cell.cellOpacity,
              animationDelay: `${cell.delay}s`,
              animationDuration: `${cell.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}