export type Bucket = { allow: number; escalate: number; block: number };

export function DecisionSplit({ allow, escalate, block }: Bucket) {
  const total = allow + escalate + block;
  if (total === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">No decisions in the last 24 hours.</p>;
  }
  const parts = [
    { key: "allowed", n: allow, bar: "bg-allow", text: "text-allow" },
    { key: "escalated", n: escalate, bar: "bg-escalate", text: "text-escalate" },
    { key: "blocked", n: block, bar: "bg-block", text: "text-block" },
  ];
  return (
    <div className="mt-4">
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-surface-3"
        role="img"
        aria-label={`${allow} allowed, ${escalate} escalated, ${block} blocked`}
      >
        {parts.map((p) =>
          p.n > 0 ? <div key={p.key} className={p.bar} style={{ width: `${(p.n / total) * 100}%` }} title={`${p.n} ${p.key}`} /> : null,
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {parts.map((p) => (
          <span key={p.key}>
            <span className={`text-2xl font-semibold ${p.text}`}>{p.n}</span>{" "}
            <span className="text-muted-foreground">
              {p.key} ({Math.round((p.n / total) * 100)}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function HourlyChart({ buckets, labels }: { buckets: Bucket[]; labels: string[] }) {
  const W = 720, H = 190, base = 150, top = 12, step = 30, bw = 20, left = 8;
  const max = Math.max(1, ...buckets.map((b) => b.allow + b.escalate + b.block));
  const scale = (base - top) / max;
  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Decisions per hour, last 24 hours" className="h-auto w-full min-w-[560px]">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={base - (base - top) * f} y2={base - (base - top) * f} stroke="var(--border)" strokeDasharray="3 4" />
        ))}
        <line x1={0} x2={W} y1={base} y2={base} stroke="var(--border)" />
        <text x={W} y={top - 2} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">{max}</text>
        {buckets.map((b, i) => {
          const x = left + i * step;
          const hA = b.allow * scale, hE = b.escalate * scale, hB = b.block * scale;
          const total = b.allow + b.escalate + b.block;
          return (
            <g key={i}>
              <title>{`${labels[i]}:00 - ${total} decisions (${b.allow} allow, ${b.escalate} escalate, ${b.block} block)`}</title>
              <rect x={x - 4} y={top} width={bw + 8} height={base - top} fill="transparent" />
              {hA > 0 && <rect x={x} y={base - hA} width={bw} height={hA} rx={2} fill="var(--allow)" />}
              {hE > 0 && <rect x={x} y={base - hA - hE} width={bw} height={hE} rx={2} fill="var(--escalate)" />}
              {hB > 0 && <rect x={x} y={base - hA - hE - hB} width={bw} height={hB} rx={2} fill="var(--block)" />}
              {i % 3 === 0 && (
                <text x={x + bw / 2} y={base + 18} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
                  {labels[i]}:00
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-allow" />Allow</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-escalate" />Escalate</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-block" />Block</span>
      </div>
    </div>
  );
}