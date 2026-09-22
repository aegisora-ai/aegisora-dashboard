const stats: [string, string][] = [
  ["8", "runtime stages per decision"],
  ["3", "possible outcomes: ALLOW, BLOCK, ESCALATE"],
  ["6", "workspace roles"],
  ["100%", "decisions linked to evidence"],
];

export function StatBand() {
  return (
    <section aria-label="Illustrative runtime statistics" className="border-y border-border bg-surface-1">
      <div className="mx-auto grid max-w-[80rem] grid-cols-2 gap-px overflow-hidden bg-border md:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="bg-surface-1 px-6 py-10 text-center md:text-left">
            <div className="text-5xl font-light tracking-tight text-foreground md:text-6xl">{value}</div>
            <div className="mt-3 text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-[80rem] px-6 pb-4 pt-2 font-mono text-[10px] tracking-wider text-muted-foreground">
        ILLUSTRATIVE MODEL FIGURES, NOT LIVE METRICS.
      </p>
    </section>
  );
}