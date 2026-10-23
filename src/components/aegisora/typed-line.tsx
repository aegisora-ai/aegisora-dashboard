"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export function TypedLine({
  phrases,
  className = "",
  decorative = false,
}: {
  phrases: readonly string[];
  className?: string;
  decorative?: boolean;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [erasing, setErasing] = useState(false);
  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), "");

  useEffect(() => {
    if (reduce || phrases.length === 0) return;
    const full = phrases[i % phrases.length];
    let t: ReturnType<typeof setTimeout>;
    if (!erasing && n < full.length) t = setTimeout(() => setN(n + 1), 52);
    else if (!erasing) t = setTimeout(() => setErasing(true), 1900);
    else if (n > 0) t = setTimeout(() => setN(n - 1), 26);
    else
      t = setTimeout(() => {
        setErasing(false);
        setI((i + 1) % phrases.length);
      }, 280);
    return () => clearTimeout(t);
  }, [reduce, phrases, i, n, erasing]);

  const shown = reduce ? (phrases[0] ?? "") : (phrases[i % phrases.length] ?? "").slice(0, n);

  return (
    <span className="block" aria-hidden={decorative ? true : undefined}>
      {!decorative && <span className="sr-only">{phrases[0]}</span>}
      <span className={"inline-grid " + className}>
        <span aria-hidden className="invisible [grid-area:1/1]">{longest}</span>
        <span aria-hidden className="[grid-area:1/1]">
          {shown}
          {!reduce && (
            <span className="ml-0.5 inline-block h-[0.85em] w-[0.07em] translate-y-[0.1em] animate-pulse bg-current" />
          )}
        </span>
      </span>
    </span>
  );
}