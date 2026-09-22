"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type Decision = {
  decision?: string;
  reason?: string;
  riskScore?: number;
  traceId?: string;
  decisionId?: string;
  executionId?: string;
  evidenceId?: string;
  enforcementStatus?: string;
  executionOutcome?: string;
  latencyMs?: number;
  live?: boolean;
  error?: string;
};

const scenarios = [
  {
    id: "allow",
    label: "ALLOW",
    tool: "echo",
    action: "tool.execute",
    requiresReview: false,
    copy: "Known tool. Standard execution path.",
  },
  {
    id: "block",
    label: "BLOCK",
    tool: "shell",
    action: "tool.execute",
    requiresReview: false,
    copy: "Restricted tool. Runtime should deny it.",
  },
  {
    id: "escalate",
    label: "ESCALATE",
    tool: "echo",
    action: "tool.execute",
    requiresReview: true,
    copy: "Same action, but explicit human review is required.",
  },
];

export default function ProofPage() {
  const [runtimeOnline, setRuntimeOnline] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<Decision | null>(null);

  useEffect(() => {
    fetch("/api/runtime-proof")
      .then((res) => res.json())
      .then((data) => setRuntimeOnline(Boolean(data.live && data.status === "ok")))
      .catch(() => setRuntimeOnline(false));
  }, []);

  async function runScenario(id: string) {
    const scenario = scenarios.find((item) => item.id === id);
    if (!scenario) return;

    setRunning(id);
    setResult(null);

    try {
      const response = await fetch("/api/runtime-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "website-proof-agent",
          tool: scenario.tool,
          action: scenario.action,
          requiresReview: scenario.requiresReview,
          input: {
            source: "website4-live-proof",
          },
        }),
      });

      const payload = await response.json();
      setRuntimeOnline(Boolean(payload.live));
      setResult(payload);
    } catch {
      setResult({
        live: false,
        error: "Runtime proof endpoint is unavailable.",
      });
    } finally {
      setRunning(null);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <Link href="/" className={styles.back}>← Aegisora</Link>
        <div className={styles.status}>
          <span className={runtimeOnline ? styles.onlineDot : styles.offlineDot} />
          {runtimeOnline ? "LIVE RUNTIME CONNECTED" : "RUNTIME NOT CONNECTED"}
        </div>
      </div>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>TECHNICAL EVALUATION</span>
        <h1>Put a real action through the 3.0 enforcement boundary.</h1>
        <p>
          These controls call the configured Aegisora runtime. There is no simulated
          decision state in this page.
        </p>
      </section>

      <section className={styles.console}>
        <div className={styles.consoleHead}>
          <div>
            <span className={styles.consoleKicker}>RUNTIME PROOF CONSOLE</span>
            <h2>Three decisions. One real gate.</h2>
          </div>
          <span className={runtimeOnline ? styles.connected : styles.disconnected}>
            {runtimeOnline ? "CONNECTED" : "CONNECT RUNTIME"}
          </span>
        </div>

        <div className={styles.scenarioGrid}>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={styles.scenario}
              onClick={() => runScenario(scenario.id)}
              disabled={running !== null}
            >
              <span className={styles.scenarioCode}>{scenario.label}</span>
              <strong>{scenario.tool}</strong>
              <span>{scenario.action}</span>
              <p>{scenario.copy}</p>
              <span className={styles.runLabel}>
                {running === scenario.id ? "Evaluating…" : "Run evaluation →"}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.result}>
          <div className={styles.resultHead}>
            <span>DECISION RESULT</span>
            {result?.live && <span className={styles.liveLabel}>LIVE</span>}
          </div>

          {!result && (
            <div className={styles.empty}>
              Choose a scenario to send an action through Aegisora.
            </div>
          )}

          {result?.error && (
            <div className={styles.error}>
              {result.error}
            </div>
          )}

          {result && !result.error && (
            <div className={styles.resultGrid}>
              <div className={styles.decisionBox}>
                <span>DECISION</span>
                <strong data-decision={result.decision}>{result.decision}</strong>
                <p>{result.reason}</p>
              </div>

              <div className={styles.detailList}>
                <div><span>Risk</span><strong>{result.riskScore ?? "—"}</strong></div>
                <div><span>Enforcement</span><strong>{result.enforcementStatus ?? "—"}</strong></div>
                <div><span>Execution</span><strong>{result.executionOutcome ?? "—"}</strong></div>
                <div><span>Latency</span><strong>{result.latencyMs ? `${result.latencyMs} ms` : "—"}</strong></div>
              </div>

              <div className={styles.ids}>
                <div><span>traceId</span><code>{result.traceId ?? "—"}</code></div>
                <div><span>decisionId</span><code>{result.decisionId ?? "—"}</code></div>
                <div><span>executionId</span><code>{result.executionId ?? "—"}</code></div>
                <div><span>evidenceId</span><code>{result.evidenceId ?? "—"}</code></div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.explain}>
        <div>
          <span className={styles.eyebrow}>WHAT THIS PROVES</span>
          <h2>The website is only the surface.</h2>
        </div>

        <div className={styles.points}>
          <div><strong>01</strong><span>The action reaches the runtime boundary before execution.</span></div>
          <div><strong>02</strong><span>The runtime returns an explicit ALLOW, BLOCK or ESCALATE decision.</span></div>
          <div><strong>03</strong><span>The result exposes trace, decision, execution and evidence identities.</span></div>
          <div><strong>04</strong><span>A blocked action remains unexecuted.</span></div>
        </div>
      </section>
    </main>
  );
}
