"use client";

import Link from "next/link";
import { useState } from "react";
import { DecisionBadge, type DecisionState } from "@/components/aegisora/state-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { btnOutline, btnPrimary } from "@/lib/ui";
import { cn } from "@/lib/utils";

const steps = ["Workspace", "Agent", "Policy", "Execution", "Decision", "Evidence"];

const rules: { value: DecisionState; title: string; text: string; gate: string; execution: string }[] = [
  { value: "ESCALATE", title: "Escalate", text: "Pause execution and require human approval.", gate: "Gate paused", execution: "Waiting for approval" },
  { value: "BLOCK", title: "Block", text: "Stop the action from executing.", gate: "Gate closed", execution: "Not executed" },
  { value: "ALLOW", title: "Allow", text: "Let the action proceed.", gate: "Gate open", execution: "Executed" },
];

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="break-all font-mono text-xs">{children}</dd>
    </div>
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [workspace, setWorkspace] = useState("demo-workspace");
  const [agent, setAgent] = useState("finance-operator");
  const [rule, setRule] = useState<DecisionState>("ESCALATE");
  const [ran, setRan] = useState(false);

  const chosen = rules.find((r) => r.value === rule) ?? rules[0];
  const canNext =
    step === 0 ? workspace.trim().length > 0 : step === 1 ? agent.trim().length > 0 : step === 3 ? ran : true;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <ol className="mb-10 grid grid-cols-6 gap-1">
        {steps.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <div className={cn("h-0.5", i <= step ? "bg-cyan" : "bg-surface-4")} />
            <div className={cn("mt-2 font-mono text-[10px] tracking-wider", i === step ? "text-foreground" : "text-muted-foreground")}>
              {String(i + 1).padStart(2, "0")}
              <span className="hidden sm:inline"> {s.toUpperCase()}</span>
            </div>
          </li>
        ))}
      </ol>

      <p className="mb-6 rounded-sm border border-escalate/30 bg-escalate-muted px-3 py-2 text-xs text-escalate">
        Prototype: this guided run simulates a decision. Nothing is saved or executed.
      </p>

      <section aria-labelledby="step-title" className="rounded-md border border-border bg-surface-2 p-6">
        {step === 0 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Create your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">Agents, policies, decisions and evidence belong to a workspace.</p>
            <div className="mt-6 space-y-1.5">
              <Label htmlFor="workspace">Workspace name</Label>
              <Input id="workspace" value={workspace} onChange={(e) => setWorkspace(e.target.value)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Connect an agent</h1>
            <p className="mt-2 text-sm text-muted-foreground">Register the agent whose actions Aegisora should evaluate.</p>
            <div className="mt-6 space-y-1.5">
              <Label htmlFor="agent">Agent name</Label>
              <Input id="agent" value={agent} onChange={(e) => setAgent(e.target.value)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Create a policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              When {agent} proposes external_transfer in production at an elevated threshold:
            </p>
            <fieldset className="mt-6 space-y-2">
              <legend className="sr-only">Policy decision</legend>
              {rules.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-sm border p-3 text-sm",
                    rule === r.value ? "border-primary bg-surface-3" : "border-border hover:bg-surface-3",
                  )}
                >
                  <input
                    type="radio"
                    name="rule"
                    value={r.value}
                    checked={rule === r.value}
                    onChange={() => {
                      setRule(r.value);
                      setRan(false);
                    }}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-mono text-xs font-semibold tracking-wider">{r.value}</span>
                    <span className="block text-muted-foreground">{r.text}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </>
        )}

        {step === 3 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Run an execution</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {agent} proposes external_transfer in production. Aegisora evaluates it against your policy.
            </p>
            <button type="button" onClick={() => setRan(true)} className={`${btnPrimary} mt-6`}>
              Run execution
            </button>
            {ran && (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5" aria-live="polite">
                <DecisionBadge state={rule} />
                <span className="text-sm text-muted-foreground">
                  {chosen.gate}. {chosen.execution}.
                </span>
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Inspect the decision</h1>
            <dl className="mt-4 divide-y divide-border/60">
              <Row k="Decision"><DecisionBadge state={rule} /></Row>
              <Row k="Agent">{agent}</Row>
              <Row k="Action">external_transfer</Row>
              <Row k="Environment">production</Row>
              <Row k="Policy">transfer-threshold</Row>
              <Row k="Risk">HIGH</Row>
              <Row k="Enforcement">{chosen.gate}</Row>
              <Row k="Execution">{chosen.execution}</Row>
            </dl>
          </>
        )}

        {step === 5 && (
          <>
            <h1 id="step-title" className="text-xl font-semibold">Inspect the evidence</h1>
            <p className="mt-2 text-sm text-muted-foreground">The decision is linked to these records (sample identifiers).</p>
            <dl className="mt-4 divide-y divide-border/60">
              <Row k="Workspace">{workspace}</Row>
              <Row k="Decision">dec_01J8XQ5N8R</Row>
              <Row k="Trace">trc_9a41c7e2</Row>
              <Row k="Execution">exe_3d8f10b5</Row>
              <Row k="Evidence">evd_c7e20a94</Row>
              <Row k="Audit">aud_58b1d3f6</Row>
            </dl>
          </>
        )}
      </section>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`${btnOutline} disabled:opacity-40`}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canNext}
            className={`${btnPrimary} disabled:opacity-40`}
          >
            Continue
          </button>
        ) : (
          <Link href="/dashboard" className={btnPrimary}>Open Aegisora Control</Link>
        )}
      </div>
    </div>
  );
}