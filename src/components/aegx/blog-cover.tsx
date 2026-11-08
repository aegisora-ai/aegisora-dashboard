import type { ReactNode } from "react";
import { POSTS } from "@/lib/blog-posts";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1);
  }).join(" ");

/** Blue glass cover art. Each post gets a different motif (by its position in POSTS). */
export function BlogCover({ seed, label }: { seed: string; label?: string }) {
  const h = hash(seed);
  const idx = POSTS.findIndex((p) => p.slug === seed);
  const v = (idx >= 0 ? idx : h) % 8;
  const id = "bc" + h.toString(36);
  const T = "url(#" + id + "t)";
  const L = "url(#" + id + "l)";
  const R = "url(#" + id + "r)";
  const E = "#bcdcff";
  const cx = 400 + ((h >> 4) % 61) - 30;
  const rnd = (k: string, n: number) => hash(seed + ":" + k) % n;
  const dots = Array.from({ length: 14 }, (_, i) => {
    const r = hash(seed + ":d" + i);
    return { x: 30 + (r % 740), y: 20 + ((r >> 8) % 410), o: 0.2 + ((r >> 16) % 50) / 100, r: 1 + ((r >> 20) % 2) };
  });
  let art: ReactNode = null;

  switch (v) {
    case 0:
      art = [0, 1, 2].map((i) => {
        const x = cx + (i - 1) * 16, y = 300 - i * 58, w = 172, hh = 86, t = 16;
        const top = x + "," + (y - hh) + " " + (x + w) + "," + y + " " + x + "," + (y + hh) + " " + (x - w) + "," + y;
        const left = (x - w) + "," + y + " " + x + "," + (y + hh) + " " + x + "," + (y + hh + t) + " " + (x - w) + "," + (y + t);
        const right = (x + w) + "," + y + " " + x + "," + (y + hh) + " " + x + "," + (y + hh + t) + " " + (x + w) + "," + (y + t);
        return (
          <g key={i} className="aegx-cover__s" style={{ animationDelay: i * 0.7 + "s" }}>
            <polygon points={left} fill={L} stroke="#9cc8ff" strokeOpacity="0.4" />
            <polygon points={right} fill={R} stroke="#9cc8ff" strokeOpacity="0.4" />
            <polygon points={top} fill={T} stroke={E} strokeOpacity="0.7" />
          </g>
        );
      });
      break;
    case 1:
      art = [0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} className="aegx-cover__s" style={{ animationDelay: i * 0.5 + "s" }} cx={cx} cy={320 - i * 42} rx={190 - i * 24} ry={60 - i * 7} fill={T} stroke={E} strokeOpacity={0.65 - i * 0.08} />
      ));
      break;
    case 2: {
      const pts = Array.from({ length: 9 }, (_, i) => ({ x: 110 + rnd("x" + i, 580), y: 80 + rnd("y" + i, 290), r: 7 + rnd("r" + i, 12) }));
      art = (
        <g className="aegx-cover__s">
          {pts.map((p, i) => (i < 8 ? <line key={"a" + i} x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y} stroke="#7db0ff" strokeOpacity="0.4" /> : null))}
          {pts.map((p, i) => (i + 3 < 9 ? <line key={"b" + i} x1={p.x} y1={p.y} x2={pts[i + 3].x} y2={pts[i + 3].y} stroke="#7db0ff" strokeOpacity="0.3" /> : null))}
          {pts.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r={p.r} fill={T} stroke={E} strokeOpacity="0.85" />))}
        </g>
      );
      break;
    }
    case 3:
      art = [0, 1, 2, 3, 4].map((i) => {
        const y = 190 + i * 42, k = rnd("w" + i, 50);
        return <path key={i} d={"M0 " + y + " C 220 " + (y - 60 + k) + " 480 " + (y + 60 - k) + " 800 " + (y - 24) + " L800 450 L0 450 Z"} fill={T} fillOpacity={0.6 - i * 0.08} stroke={E} strokeOpacity={0.75 - i * 0.12} />;
      });
      break;
    case 4:
      art = Array.from({ length: 12 }, (_, i) => {
        const c = i % 4, r = Math.floor(i / 4), hi = rnd("t" + i, 5) === 0;
        return <rect key={i} x={136 + c * 136} y={89 + r * 96} width={120} height={80} rx={14} fill={T} fillOpacity={hi ? 1 : 0.25 + rnd("o" + i, 40) / 100} stroke={E} strokeOpacity={hi ? 0.9 : 0.35} />;
      });
      break;
    case 5:
      art = (
        <g className="aegx-cover__s">
          {[0, 1, 2, 3].map((i) => (<polygon key={i} points={hex(cx, 235, 170 - i * 40)} fill={T} fillOpacity={0.3 + i * 0.14} stroke={E} strokeOpacity={0.8 - i * 0.1} />))}
        </g>
      );
      break;
    case 6:
      art = [0, 1, 2, 3, 4, 5].map((i) => {
        const r = 60 + i * 50;
        return <path key={i} d={"M" + (cx - r) + " 380 A" + r + " " + r + " 0 0 1 " + (cx + r) + " 380"} fill="none" stroke="#7db0ff" strokeOpacity={0.95 - i * 0.13} strokeWidth={16 - i * 2} strokeLinecap="round" />;
      });
      break;
    default:
      art = Array.from({ length: 7 }, (_, i) => {
        const hgt = 90 + rnd("p" + i, 200);
        return (
          <g key={i} className="aegx-cover__s" style={{ animationDelay: i * 0.3 + "s" }}>
            <rect x={138 + i * 78} y={390 - hgt} width={56} height={hgt} rx={10} fill={T} stroke={E} strokeOpacity="0.6" />
            <line x1={148 + i * 78} y1={392 - hgt} x2={182 + i * 78} y2={392 - hgt} stroke="#fff" strokeOpacity="0.6" />
          </g>
        );
      });
  }

  return (
    <svg className="aegx-cover" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label ?? "Cover"}>
      <defs>
        <radialGradient id={id + "g"} cx="50%" cy="100%" r="75%">
          <stop offset="0" stopColor="#1f7aff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#1f7aff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id + "t"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8d0ff" stopOpacity="0.62" />
          <stop offset="1" stopColor="#1f7aff" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={id + "l"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f7aff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#0a2a8f" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={id + "r"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a2a8f" stopOpacity="0.65" />
          <stop offset="1" stopColor="#04123f" stopOpacity="0.4" />
        </linearGradient>
        <pattern id={id + "p"} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity="0.05" />
        </pattern>
      </defs>
      <rect width="800" height="450" fill="#000" />
      <rect width="800" height="450" fill={"url(#" + id + "p)"} />
      <rect width="800" height="450" fill={"url(#" + id + "g)"} />
      {dots.map((d, i) => (<circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#8fb8ff" opacity={d.o} />))}
      {art}
      {label ? (<text x="32" y="46" fill="#8fb4ff" fontSize="13" fontFamily="ui-monospace, Menlo, Consolas, monospace" letterSpacing="2">{label.toUpperCase()}</text>) : null}
    </svg>
  );
}