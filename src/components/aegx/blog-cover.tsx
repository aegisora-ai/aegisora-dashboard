function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Deterministic blue glass-slab cover art, generated from the post slug. */
export function BlogCover({ seed, label }: { seed: string; label?: string }) {
  const h = hash(seed);
  const v = h % 4;
  const id = "bc" + h.toString(36);
  const cx = 400 + ((h >> 4) % 70) - 35;
  const w = 168 + v * 12;
  const hh = Math.round(w * 0.5);
  const t = 16;
  const gap = 54 + v * 4;
  const slabs = [0, 1, 2].map((i) => ({ i, x: cx + (v % 2 === 0 ? 1 : -1) * (i - 1) * 16, y: 292 - i * gap }));
  const dots = Array.from({ length: 16 }, (_, i) => {
    const r = hash(seed + ":" + i);
    return { x: 30 + (r % 740), y: 20 + ((r >> 8) % 410), o: 0.2 + ((r >> 16) % 50) / 100, r: 1 + ((r >> 20) % 2) };
  });
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
      {slabs.map((s) => {
        const top = s.x + "," + (s.y - hh) + " " + (s.x + w) + "," + s.y + " " + s.x + "," + (s.y + hh) + " " + (s.x - w) + "," + s.y;
        const left = (s.x - w) + "," + s.y + " " + s.x + "," + (s.y + hh) + " " + s.x + "," + (s.y + hh + t) + " " + (s.x - w) + "," + (s.y + t);
        const right = (s.x + w) + "," + s.y + " " + s.x + "," + (s.y + hh) + " " + s.x + "," + (s.y + hh + t) + " " + (s.x + w) + "," + (s.y + t);
        return (
          <g key={s.i} className="aegx-cover__s" style={{ animationDelay: s.i * 0.7 + "s" }}>
            <polygon points={left} fill={"url(#" + id + "l)"} stroke="#9cc8ff" strokeOpacity="0.4" />
            <polygon points={right} fill={"url(#" + id + "r)"} stroke="#9cc8ff" strokeOpacity="0.4" />
            <polygon points={top} fill={"url(#" + id + "t)"} stroke="#bcdcff" strokeOpacity="0.7" />
          </g>
        );
      })}
      {label ? (<text x="32" y="46" fill="#8fb4ff" fontSize="13" fontFamily="ui-monospace, Menlo, Consolas, monospace" letterSpacing="2">{label.toUpperCase()}</text>) : null}
    </svg>
  );
}