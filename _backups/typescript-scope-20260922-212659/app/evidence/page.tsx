import Link from "next/link";
import {
  ArrowRight,
  Database,
  FileCheck2,
  Fingerprint,
  GitBranch,
} from "lucide-react";
import { SiteHeader } from "../../components/site-header";

export default function EvidencePage() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="page-wrap">
            <div className="eyebrow">
              Audit & evidence
            </div>

            <h1 className="display" style={{ marginTop: 22 }}>
              Every decision should
              <br />
              <span className="display-accent">
                leave an evidence trail.
              </span>
            </h1>

            <p className="lead">
              Runtime control becomes operationally useful when
              the decision can be traced back to the request,
              identity, enforcement state and resulting evidence.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="page-wrap">
            <div className="grid grid-4">
              {[
                ["Trace ID", Fingerprint],
                ["Decision ID", ShieldIcon],
                ["Execution ID", GitBranch],
                ["Evidence ID", FileCheck2],
              ].map(([label, Icon]) => (
                <div className="panel" style={{ padding: 20 }} key={String(label)}>
                  <Icon size={17} color="#65d6ff" />
                  <div className="metric-label" style={{ marginTop: 20 }}>
                    {String(label)}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: "#dbe6ef",
                      fontSize: 13,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                  >
                    7d81...f4a2
                  </div>
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
                  Evidence chain
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
                  Request to decision to
                  evidence.
                </h2>
              </div>

              <div className="panel" style={{ padding: 24 }}>
                {[
                  ["Action request", "What was attempted?"],
                  ["Runtime identity", "Which agent requested it?"],
                  ["Policy state", "Which policy was active?"],
                  ["Decision", "Why was it allowed, blocked or escalated?"],
                  ["Evidence", "Which identifiers prove the event chain?"],
                ].map(([title, text], index) => (
                  <div
                    className="panel-soft"
                    style={{
                      padding: 14,
                      marginTop: index === 0 ? 0 : 8,
                    }}
                    key={title}
                  >
                    <strong style={{ fontSize: 12 }}>
                      {title}
                    </strong>
                    <div
                      className="muted"
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                      }}
                    >
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 30 }}>
              <Link
                href="/proof"
                className="button button-primary"
              >
                Generate a real decision
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ShieldIcon(props: { size?: number; color?: string }) {
  return (
    <svg
      width={props.size ?? 18}
      height={props.size ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color ?? "currentColor"}
      strokeWidth="1.8"
    >
      <path d="M12 3l7 3v5c0 4.6-2.8 7.6-7 10-4.2-2.4-7-5.4-7-10V6l7-3z" />
      <path d="M9.2 12.2l1.8 1.8 3.8-4" />
    </svg>
  );
}