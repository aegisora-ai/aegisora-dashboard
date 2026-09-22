"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Result = {
  live?: boolean;
  decision?: string;
  reason?: string;
  riskScore?: number;
  enforcementStatus?: string;
  executionOutcome?: string;
  traceId?: string;
  decisionId?: string;
  executionId?: string;
  evidenceId?: string;
  runtime?: string;
  latencyMs?: number;
};

const scenarios = [
  {
    id: "allow",
    label: "ALLOW",
    description:
      "Known tool + no human review requirement.",
    payload: {
      tool: "echo",
      requiresReview: false,
    },
    className: "decision-allow",
  },
  {
    id: "block",
    label: "BLOCK",
    description:
      "Restricted shell capability.",
    payload: {
      tool: "shell",
      requiresReview: false,
    },
    className: "decision-block",
  },
  {
    id: "escalate",
    label: "ESCALATE",
    description:
      "Review is explicitly required.",
    payload: {
      tool: "echo",
      requiresReview: true,
    },
    className: "decision-escalate",
  },
];

export default function ProofPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function runScenario(
    id: string,
    payload: {
      tool: string;
      requiresReview: boolean;
    },
  ) {
    setLoading(id);

    try {
      const response = await fetch(
        "/api/runtime-proof",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId: "website-proof-agent",
            action: "tool.execute",
            tool: payload.tool,
            requiresReview:
              payload.requiresReview,
            input: {
              source: "aegisora-proof-page",
            },
          }),
        },
      );

      const body = (await response.json()) as Result & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          body.error ||
            body.reason ||
            "Runtime request failed.",
        );
      }

      setResult(body);

      toast.success(
        `Live decision: ${body.decision}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Runtime request failed.",
      );
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    let active = true;

    fetch("/api/runtime-proof", {
      method: "GET",
    })
      .then(async (response) => {
        if (!active) return;

        setConnected(response.ok);
      })
      .catch(() => {
        if (active) {
          setConnected(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" href="/">
            <span className="brand-mark">A</span>
            <span className="brand-copy">
              <span className="brand-name">AEGISORA</span>
              <span className="brand-sub">
                runtime proof
              </span>
            </span>
          </Link>

          <div className="site-header-actions">
            <Link href="/" className="button">
              Back to site
            </Link>

            <Link
              href="/login"
              className="button button-primary"
            >
              Open workspace
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="page-wrap">
            <div className="eyebrow">
              Aegisora 3.0 live runtime proof
            </div>

            <h1
              className="display"
              style={{ marginTop: 22 }}
            >
              Put a real action
              <br />
              <span className="display-accent">
                through the boundary.
              </span>
            </h1>

            <p className="lead">
              This page does not simulate a decision. It sends a
              real action request to the configured Aegisora
              runtime proof service.
            </p>

            <div style={{ marginTop: 25 }}>
              <span className="tag">
                <span
                  className={
                    connected
                      ? "status-dot status-online"
                      : "status-dot status-amber"
                  }
                />
                {connected
                  ? "Live runtime connected"
                  : connected === false
                    ? "Runtime not connected"
                    : "Checking runtime"}
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="decision-grid">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  className="panel decision-card"
                  style={{
                    textAlign: "left",
                    color: "inherit",
                  }}
                  onClick={() =>
                    runScenario(
                      scenario.id,
                      scenario.payload,
                    )
                  }
                  disabled={loading !== null}
                >
                  <div className="decision-title">
                    <h3>{scenario.label}</h3>

                    {loading === scenario.id ? (
                      <Loader2
                        size={18}
                        color="#65d6ff"
                        style={{
                          animation:
                            "spin 1s linear infinite",
                        }}
                      />
                    ) : (
                      <CheckCircle2
                        size={18}
                        className={scenario.className}
                      />
                    )}
                  </div>

                  <p className="decision-detail">
                    {scenario.description}
                  </p>

                  <div className="decision-code">
                    tool = "{scenario.payload.tool}"
                    <br />
                    requiresReview ={" "}
                    {String(
                      scenario.payload
                        .requiresReview,
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="panel" style={{ padding: 24 }}>
              <div className="panel-heading">
                <div>
                  <h3>Live result</h3>
                  <p>
                    Runtime decision artifact
                  </p>
                </div>
              </div>

              {result ? (
                <div className="grid grid-2">
                  <div className="panel-soft" style={{ padding: 18 }}>
                    <div className="metric-label">
                      Decision
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 36,
                        fontWeight: 850,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {result.decision}
                    </div>

                    <p
                      className="muted"
                      style={{
                        fontSize: 12,
                        lineHeight: 1.7,
                      }}
                    >
                      {result.reason}
                    </p>
                  </div>

                  <div
                    className="grid grid-2"
                    style={{
                      gap: 8,
                    }}
                  >
                    {[
                      ["Risk", result.riskScore],
                      [
                        "Enforcement",
                        result.enforcementStatus,
                      ],
                      [
                        "Outcome",
                        result.executionOutcome,
                      ],
                      [
                        "Latency",
                        result.latencyMs
                          ? `${result.latencyMs} ms`
                          : "—",
                      ],
                    ].map(([label, value]) => (
                      <div
                        className="panel-soft"
                        style={{ padding: 14 }}
                        key={String(label)}
                      >
                        <div className="metric-label">
                          {String(label)}
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            color: "#dbe6ef",
                            fontSize: 12,
                          }}
                        >
                          {String(value ?? "—")}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="panel-soft"
                    style={{
                      padding: 15,
                      gridColumn: "1 / -1",
                    }}
                  >
                    <div className="metric-label">
                      Evidence identity
                    </div>

                    <div
                      style={{
                        marginTop: 9,
                        color: "#93a8bd",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                        lineHeight: 1.85,
                        fontSize: 10,
                      }}
                    >
                      traceId: {result.traceId}
                      <br />
                      decisionId: {result.decisionId}
                      <br />
                      executionId: {result.executionId}
                      <br />
                      evidenceId: {result.evidenceId}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="callout"
                  style={{ minHeight: 190 }}
                >
                  <strong>
                    No runtime decision loaded.
                  </strong>

                  <span>
                    Select ALLOW, BLOCK or ESCALATE above.
                    The actual decision and evidence identity
                    will appear here.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}