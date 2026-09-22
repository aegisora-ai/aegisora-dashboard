import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { SiteHeader } from "../../components/site-header";

const steps = [
  ["01", "Action request", "A model or agent proposes a tool/API action."],
  ["02", "Canonical context", "Identity, action, metadata and runtime context are assembled."],
  ["03", "Policy + permission", "Capability and policy constraints are evaluated."],
  ["04", "Risk + security", "Security and risk checks produce the runtime decision context."],
  ["05", "Enforcement decision", "Aegisora returns ALLOW, BLOCK or ESCALATE."],
  ["06", "Evidence", "The decision is bound to trace, execution and evidence identifiers."],
];

export default function HowItWorksPage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="page-wrap">
            <div className="eyebrow">
              How it works
            </div>

            <h1 className="display" style={{ marginTop: 22 }}>
              Security belongs
              <br />
              <span className="display-accent">
                at the action boundary.
              </span>
            </h1>

            <p className="lead">
              Aegisora is positioned between agent intent and
              execution. The runtime does not decide what the
              model should think. It decides what the agent is
              actually allowed to execute.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="grid grid-2">
              {steps.map(([number, title, text]) => (
                <div
                  className="panel"
                  style={{ padding: 24 }}
                  key={number}
                >
                  <div
                    className="metric-label"
                    style={{ color: "#65d6ff" }}
                  >
                    {number}
                  </div>

                  <h2
                    style={{
                      margin: "18px 0 8px",
                      fontSize: 22,
                    }}
                  >
                    {title}
                  </h2>

                  <p
                    className="muted"
                    style={{
                      margin: 0,
                      lineHeight: 1.75,
                      fontSize: 13,
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="grid grid-2">
              <div>
                <div className="eyebrow">
                  Execution model
                </div>

                <h2
                  style={{
                    marginTop: 18,
                    fontSize:
                      "clamp(36px, 4vw, 58px)",
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                  }}
                >
                  The policy result
                  is not an observation.
                </h2>
              </div>

              <div
                className="panel"
                style={{
                  padding: 24,
                  display: "grid",
                  gap: 11,
                }}
              >
                {[
                  "ALLOW â€” action may continue",
                  "BLOCK â€” action is prevented",
                  "ESCALATE â€” permission review is required",
                ].map((item) => (
                  <div
                    className="panel-soft"
                    style={{
                      padding: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                    key={item}
                  >
                    <CheckCircle2
                      size={15}
                      color="#65d6ff"
                    />
                    <span
                      style={{
                        color: "#dce7ef",
                        fontSize: 12,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 30,
                display: "flex",
                gap: 10,
              }}
            >
              <Link
                href="/proof"
                className="button button-primary"
              >
                Run live proof
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}