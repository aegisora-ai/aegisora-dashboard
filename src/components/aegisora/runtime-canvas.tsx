const stages = [
  { id: "REQUEST", note: "The agent proposes an action." },
  { id: "CONTEXT", note: "Workspace, identity and environment are resolved." },
  { id: "POLICY", note: "The applicable policy is evaluated." },
  { id: "RISK", note: "Risk is assessed from the action and its context." },
  { id: "DECISION", note: "ALLOW, BLOCK or ESCALATE is issued." },
  { id: "ENFORCEMENT", note: "The execution gate opens, stops or pauses." },
  { id: "EXECUTION", note: "The action runs in the environment, or it does not." },
  { id: "EVIDENCE", note: "A record of the decision remains." },
];

const START = 90;
const STEP = 145;
const Y = 150;

export function RuntimeCanvas() {
  const boundaryX = START + STEP * 5.5;

  return (
    <figure className="rounded-md border border-border bg-surface-1 p-4 md:p-6">
      <svg
        viewBox="0 0 1200 300"
        role="img"
        aria-labelledby="runtime-canvas-title"
        className="hidden w-full md:block"
      >
        <title id="runtime-canvas-title">
          Aegisora runtime: request, context, policy, risk, decision, enforcement, execution, evidence
        </title>
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" className="stroke-surface-3" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1200" height="300" fill="url(#grid)" />

        <line x1={START} y1={Y} x2={START + STEP * 7} y2={Y} className="stroke-surface-4" strokeWidth="2" />

        <line
          x1={boundaryX} y1="36" x2={boundaryX} y2="264"
          className="stroke-cyan" strokeWidth="1" strokeDasharray="4 4" opacity="0.7"
        />
        <text x={boundaryX} y="26" textAnchor="middle" className="fill-cyan font-mono" fontSize="10" letterSpacing="2">
          EXECUTION BOUNDARY
        </text>

        {stages.map((s, i) => {
          const cx = START + STEP * i;
          const isDecision = s.id === "DECISION";
          const w = isDecision ? 140 : 116;
          const h = isDecision ? 80 : 56;
          return (
            <g key={s.id}>
              <rect
                x={cx - w / 2} y={Y - h / 2} width={w} height={h} rx="3"
                className={isDecision ? "fill-surface-3 stroke-primary" : "fill-surface-2 stroke-border"}
                strokeWidth={isDecision ? 1.5 : 1}
              />
              <text x={cx} y={Y - h / 2 - 10} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="10">
                {String(i + 1).padStart(2, "0")}
              </text>
              <text x={cx} y={Y + 4} textAnchor="middle" className="fill-foreground font-mono" fontSize="11" fontWeight="600" letterSpacing="1.5">
                {s.id}
              </text>
              {isDecision && (
                <text x={cx} y={Y + 24} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize="9">
                  ALLOW · BLOCK · ESCALATE
                </text>
              )}
            </g>
          );
        })}

        <g className="motion-reduce:hidden">
          <circle r="4" className="fill-cyan">
            <animateMotion dur="7s" repeatCount="indefinite" path={`M ${START} ${Y} L ${START + STEP * 7} ${Y}`} />
          </circle>
        </g>
      </svg>

      <figcaption className="sr-only">
        The runtime pipeline has eight stages, listed below.
      </figcaption>

      <ol className="grid gap-px overflow-hidden rounded-sm border border-border bg-border md:mt-6 md:grid-cols-4">
        {stages.map((s, i) => (
          <li key={s.id} className="bg-surface-2 p-4">
            <div className="font-mono text-[10px] text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="mt-1 font-mono text-xs font-semibold tracking-[0.15em]">{s.id}</div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}