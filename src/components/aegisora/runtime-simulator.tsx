"use client";

import { useEffect, useState } from "react";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

const STAGES = [
  "REQUEST",
  "CONTEXT",
  "POLICY",
  "RISK",
  "DECISION",
  "ENFORCEMENT",
  "EXECUTION",
  "EVIDENCE",
] as const;

type Outcome = "ALLOW" | "BLOCK" | "ESCALATE";

const tone: Record<Outcome, { text: string; bg: string }> = {
  ALLOW: { text: "text-allow", bg: "bg-allow-muted" },
  BLOCK: { text: "text-block", bg: "bg-block-muted" },
  ESCALATE: { text: "text-escalate", bg: "bg-escalate-muted" },
};

const scenarios: { outcome: Outcome; values: string[] }[] = [
  {
    outcome: "ESCALATE",
    values: [
      "finance-operator proposes external_transfer",
      "production / demo-workspace",
      "transfer-threshold-v4",
      "HIGH: external destination, elevated amount",
      "ESCALATE: human authorization required",
      "Gate paused",
      "Waiting for approval",
      "evd_a24c07f1 / approval apr_9d41e7a3 PENDING",
    ],
  },
  {
    outcome: "ALLOW",
    values: [
      "report-builder proposes read_report_data",
      "staging / demo-workspace",
      "read-only-reporting-v2",
      "LOW: read-only, in-scope target",
      "ALLOW: matches an allowed rule",
      "Gate open",
      "Executed",
      "evd_6b30f2a9",
    ],
  },
  {
    outcome: "BLOCK",
    values: [
      "ops-assistant proposes delete_records",
      "production / demo-workspace",
      "prod-data-protection-v1",
      "CRITICAL: destructive bulk operation",
      "BLOCK: prohibited by policy",
      "Gate closed",
      "Not executed",
      "evd_f81d5c30",
    ],
  },
];

export function RuntimeSimulator() {
  const [scenario, setScenario] = useState(0);
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount aninda gercek bir external API (matchMedia) ile senkronizasyon
      setReduced(true);
      setStage(STAGES.length);
    }
  }, []);

  useEffect(() => {
    if (reduced || !auto) return;
    const t = setTimeout(
      () => {
        if (stage < STAGES.length) setStage(stage + 1);
        else {
          setScenario((scenario + 1) % scenarios.length);
          setStage(0);
        }
      },
      stage < STAGES.length ? 850 : 3400,
    );
    return () => clearTimeout(t);
  }, [stage, scenario, auto, reduced]);

  const current = scenarios[scenario];
  const done = stage >= STAGES.length;
  const t = tone[current.outcome];

  function pick(i: number) {
    setScenario(i);
    setAuto(false);
    setStage(STAGES.length);
  }

  function replay() {
    setStage(reduced ? STAGES.length : 0);
    setAuto(!reduced);
  }

  return (
    <section aria-label="Runtime execution simulation" className="rounded-md border border-border bg-surface-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <p className="font-mono text-sm tracking-wider text-muted-foreground">
          ILLUSTRATIVE SCENARIO. NOT LIVE DATA.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {scenarios.map((s, i) => (
            <button
              key={s.outcome}
              type="button"
              aria-pressed={i === scenario}
              onClick={() => pick(i)}
              className={cn(
                "rounded-sm border px-4 py-2 font-mono text-sm tracking-wider transition-colors",
                i === scenario
                  ? cn("border-border bg-surface-4", tone[s.outcome].text)
                  : "border-border text-muted-foreground hover:bg-surface-3",
                focusRing,
              )}
            >
              {s.outcome}
            </button>
          ))}
          <button
            type="button"
            onClick={replay}
            className={cn("rounded-sm border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-3", focusRing)}
          >
            Replay
          </button>
        </div>
      </div>

      <ol className="grid grid-cols-2 gap-px overflow-hidden border-b border-border bg-border sm:grid-cols-4 lg:grid-cols-8">
        {STAGES.map((label, i) => {
          const state = stage > i ? "done" : stage === i && !done ? "active" : "pending";
          const isDecision = i === 4;
          return (
            <li
              key={label}
              className={cn(
                "bg-surface-2 p-4 transition-colors duration-300",
                state === "active" && "bg-surface-4",
                isDecision && state === "done" && t.bg,
              )}
            >
              <div className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
              <div
                className={cn(
                  "mt-1 font-mono text-sm font-semibold tracking-wider",
                  state === "pending" ? "text-muted-foreground/50" : "text-foreground",
                  isDecision && state === "done" && t.text,
                )}
              >
                {label}
              </div>
              <div className="mt-2 h-0.5 bg-surface-4">
                <div
                  className={cn(
                    "h-full bg-cyan transition-all duration-500",
                    state === "pending" ? "w-0" : state === "active" ? "w-1/2" : "w-full",
                  )}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <dl className="divide-y divide-border/60 px-6">
        {STAGES.map((label, i) => {
          const revealed = stage > i;
          const colored = revealed && (i === 4 || i === 5);
          return (
            <div key={label} className="grid grid-cols-[130px_1fr] gap-4 py-3.5 text-sm md:grid-cols-[160px_1fr]">
              <dt className="font-mono text-sm tracking-wider text-muted-foreground">{label}</dt>
              <dd className={cn("font-mono text-sm", revealed ? (colored ? t.text : "text-foreground") : "text-muted-foreground/40")}>
                {revealed ? current.values[i] : "pending"}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="sr-only" aria-live="polite">
        {done ? `${current.outcome}. ${current.values[4]}` : ""}
      </p>
    </section>
  );
}