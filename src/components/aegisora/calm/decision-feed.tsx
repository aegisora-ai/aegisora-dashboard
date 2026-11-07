"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SAMPLES } from "../bw/bw-data";
import type { Sample } from "../bw/bw-data";

type Row = { key: number; s: Sample };
const POOL: Sample[] = SAMPLES.filter((s) => s.id !== "default");

export function DecisionFeed() {
  const t = useTranslations("HomeCalm.feed");
  const [rows, setRows] = useState<Row[]>(() => POOL.slice(0, 4).map((s, i) => ({ key: i, s })));
  const next = useRef(4);

  useEffect(() => {
    if (POOL.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const n = next.current++;
      setRows((cur) => [{ key: n, s: POOL[n % POOL.length] }, ...cur].slice(0, 5));
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="vc-glass" style={{ padding: 18 }}>
      <div className="vc-feed__bar"><span className="vc-dot" aria-hidden="true" />{t("label")}</div>
      <ul className="vc-feed">
        {rows.map((r) => (
          <li key={r.key} className="vc-feed__row">
            <span className={"vc-pill vc-pill--" + r.s.verdict}><i aria-hidden="true" />{r.s.verdict}</span>
            <code>{r.s.action}</code>
            <span className="vc-feed__agent">{r.s.agent}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}