const stats: [string, string][] = [
  ["8", "runtime stages per decision"],
  ["3", "possible outcomes: ALLOW, BLOCK, ESCALATE"],
  ["6", "workspace roles"],
  ["100%", "decisions linked to evidence"],
];

export function StatBand() {
  return (
    <section aria-label="Illustrative runtime statistics" className="border-y border-border bg-surface-1">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="bg-surface-1 px-6 py-8 text-center md:text-left">
            <div className="text-4xl font-light tracking-tight text-foreground md:text-5xl">{value}</div>
            <div className="mt-2 text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-6xl px-6 pb-4 pt-2 font-mono text-[10px] tracking-wider text-muted-foreground">
        ILLUSTRATIVE MODEL FIGURES, NOT LIVE METRICS.
      </p>
    </section>
  );
}