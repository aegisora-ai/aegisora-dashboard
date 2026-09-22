import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  FileCheck2,
  LockKeyhole,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";
import { RuntimeCanvas } from "../components/runtime-canvas";
import { SiteHeader } from "../components/site-header";

export default function HomePage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="page-wrap hero-grid">
            <div>
              <div className="eyebrow">
                Runtime security for AI agents
              </div>

              <h1
                className="display"
                style={{ marginTop: 23 }}
              >
                Donâ€™t just secure
                <br />
                the model.
                <br />
                <span className="display-accent">
                  Secure what the agent
                  <br />
                  is allowed to do.
                </span>
              </h1>

              <p className="lead">
                Aegisora sits at the execution boundary of
                autonomous AI agents, evaluating actions
                before they reach tools, APIs and production
                systems.
              </p>

              <div className="hero-actions">
                <Link
                  href="/proof"
                  className="button button-primary"
                >
                  Run live runtime proof
                  <ArrowRight size={14} />
                </Link>

                <a
                  href="https://github.com/aegisora-ai/aegisora"
                  target="_blank"
                  rel="noreferrer"
                  className="button"
                >
                  Inspect the open source
                </a>
              </div>

              <div className="hero-tags">
                <span className="tag">3.0 execution boundary</span>
                <span className="tag">Policy enforcement</span>
                <span className="tag">Audit & evidence</span>
                <span className="tag">Human escalation</span>
              </div>
            </div>

            <div className="hero-canvas">
              <RuntimeCanvas />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="eyebrow">
              The control problem
            </div>

            <div
              className="grid grid-2"
              style={{
                marginTop: 24,
                alignItems: "end",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  maxWidth: 760,
                  fontSize:
                    "clamp(38px, 5vw, 66px)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.05em",
                }}
              >
                Agent reasoning is not an
                authorization system.
              </h2>

              <p
                className="lead"
                style={{
                  margin: 0,
                  fontSize: 15,
                }}
              >
                An agent can decide to call a tool. That does
                not mean the tool call should execute. Aegisora
                places policy, permission, security and risk
                evaluation between the request and the
                execution boundary.
              </p>
            </div>

            <div
              className="grid grid-3"
              style={{ marginTop: 45 }}
            >
              {[
                [
                  LockKeyhole,
                  "Observe",
                  "See the action request, context and identity before execution.",
                ],
                [
                  Shield,
                  "Control",
                  "Apply deterministic policy and capability constraints at runtime.",
                ],
                [
                  FileCheck2,
                  "Prove",
                  "Bind the decision to trace, execution and evidence identifiers.",
                ],
              ].map(([Icon, title, text]) => (
                <div
                  className="panel"
                  style={{ padding: 22 }}
                  key={String(title)}
                >
                  <Icon
                    size={18}
                    color="#65d6ff"
                  />

                  <h3
                    style={{
                      margin:
                        "19px 0 8px",
                      fontSize: 18,
                    }}
                  >
                    {String(title)}
                  </h3>

                  <p
                    className="muted"
                    style={{
                      margin: 0,
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    {String(text)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="eyebrow">
              Runtime architecture
            </div>

            <h2
              style={{
                margin: "18px 0 0",
                maxWidth: 900,
                fontSize:
                  "clamp(38px, 5vw, 64px)",
                lineHeight: 1,
                letterSpacing: "-0.05em",
              }}
            >
              Request. Context. Policy. Risk.
              Decision. Execution. Evidence.
            </h2>

            <div className="flow-line">
              {[
                "Request",
                "Context",
                "Policy",
                "Risk",
                "Decision",
                "Execution",
                "Evidence",
              ].map((name, index) => (
                <div
                  className="panel flow-node"
                  key={name}
                >
                  <span className="flow-index">
                    0{index + 1}
                  </span>

                  <span className="flow-name">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="eyebrow">
              Decision boundary
            </div>

            <h2
              style={{
                margin: "18px 0 0",
                fontSize:
                  "clamp(38px, 5vw, 64px)",
                letterSpacing: "-0.05em",
              }}
            >
              The runtime decides before
              execution happens.
            </h2>

            <div className="decision-grid">
              <Decision
                title="ALLOW"
                description="Known capability, policy and security checks pass."
                code={'tool.execute â†’ "echo"'}
                tone="decision-allow"
              />

              <Decision
                title="BLOCK"
                description="Restricted capability is denied before the tool can execute."
                code={'tool.execute â†’ "shell"'}
                tone="decision-block"
              />

              <Decision
                title="ESCALATE"
                description="The action requires permission review before execution."
                code={'requiresReview â†’ true'}
                tone="decision-escalate"
              />
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/proof"
                className="button button-primary"
              >
                Test the live boundary
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/evidence"
                className="button"
              >
                Inspect evidence model
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div
              className="panel"
              style={{
                padding: "46px 42px",
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) auto",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div>
                <div className="eyebrow">
                  Build with the runtime
                </div>

                <h2
                  style={{
                    margin:
                      "18px 0 9px",
                    fontSize:
                      "clamp(32px, 4vw, 54px)",
                    letterSpacing: "-0.05em",
                  }}
                >
                  Connect the agent.
                  <br />
                  Govern the action.
                </h2>

                <p
                  className="muted"
                  style={{
                    maxWidth: 720,
                    lineHeight: 1.7,
                    fontSize: 13,
                  }}
                >
                  Aegisora is open source. The runtime
                  boundary is designed to sit beneath your
                  agent orchestration layer rather than
                  replacing it.
                </p>
              </div>

              <Link
                href="/login"
                className="button button-primary"
              >
                Open workspace
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Decision({
  title,
  description,
  code,
  tone,
}: {
  title: string;
  description: string;
  code: string;
  tone: string;
}) {
  return (
    <div className="panel decision-card">
      <div className="decision-title">
        <h3>{title}</h3>
        <CircleCheck size={18} className={tone} />
      </div>

      <p className="decision-detail">
        {description}
      </p>

      <div className="decision-code">
        {code}
      </div>
    </div>
  );
}