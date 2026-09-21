import { cn } from "@/lib/utils";

export type DecisionState = "ALLOW" | "BLOCK" | "ESCALATE";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

const decisionStyle: Record<DecisionState, string> = {
  ALLOW: "border-allow/40 bg-allow-muted text-allow",
  BLOCK: "border-block/40 bg-block-muted text-block",
  ESCALATE: "border-escalate/40 bg-escalate-muted text-escalate",
};

export function DecisionBadge({
  state,
  className,
}: {
  state: DecisionState;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider",
        decisionStyle[state],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {state}
    </span>
  );
}

const riskIndex: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export function RiskIndicator({ level }: { level: RiskLevel }) {
  const n = riskIndex[level];
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-foreground">
      <span aria-hidden className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-1.5 rounded-[1px]",
              i <= n ? "bg-cyan" : "bg-surface-4",
            )}
          />
        ))}
      </span>
      {level}
    </span>
  );
}

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] tracking-wider",
        status === "PENDING"
          ? "border-escalate/40 bg-escalate-muted text-escalate"
          : "border-border bg-surface-3 text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}