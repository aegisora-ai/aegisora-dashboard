export function RequestFlow() {
  const line = { stroke: "var(--muted-foreground)", strokeWidth: 1.5, fill: "none", markerEnd: "url(#docs-arrow)" } as const;
  return (
    <figure>
      <div className="overflow-x-auto rounded-2xl border border-border bg-background p-4">
        <svg viewBox="0 0 900 220" role="img" aria-label="Your agent sends an evaluate request. Aegisora returns a decision with an evidence reference before the action runs." className="h-auto w-full min-w-[680px]">
          <defs>
            <marker id="docs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--muted-foreground)" />
            </marker>
          </defs>
          <rect x={20} y={70} width={170} height={80} rx={12} fill="var(--surface-1)" stroke="var(--border)" />
          <text x={105} y={106} textAnchor="middle" fontSize={15} fontWeight={600} fill="var(--foreground)">Your agent</text>
          <text x={105} y={128} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">about to act</text>

          <rect x={365} y={50} width={170} height={120} rx={14} fill="var(--surface-1)" stroke="var(--primary)" strokeWidth={1.5} />
          <text x={450} y={102} textAnchor="middle" fontSize={15} fontWeight={600} fill="var(--foreground)">Aegisora</text>
          <text x={450} y={124} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">policy + risk + auth</text>

          <rect x={710} y={70} width={170} height={80} rx={12} fill="var(--surface-1)" stroke="var(--border)" />
          <text x={795} y={106} textAnchor="middle" fontSize={15} fontWeight={600} fill="var(--foreground)">Tool / API</text>
          <text x={795} y={128} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">runs only if allowed</text>

          <path d="M190 95 H363" {...line} />
          <text x={277} y={86} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">1. evaluate</text>
          <path d="M363 130 H192" {...line} />
          <text x={277} y={150} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">2. decision</text>
          <path d="M535 110 H708" {...line} />
          <text x={622} y={100} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">3. execute</text>
        </svg>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">The decision is returned before the action executes.</figcaption>
    </figure>
  );
}