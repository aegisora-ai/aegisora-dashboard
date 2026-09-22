import Link from "next/link"

import { AegisoraFooter } from "@/components/aegisora/footer"
import { AegisoraHeader } from "@/components/aegisora/header"
import { RuntimeCanvas } from "@/components/aegisora/runtime-canvas"

export default function HomePage() {
  return (
    <div className="ae-page">

      <AegisoraHeader />

      <main>

        <section className="ae-section">

          <div className="ae-wrap">

            <div className="ae-eyebrow">
              Aegisora 3.0
            </div>

            <h1 className="ae-section-title">
              Don&apos;t just secure the model.
              <br />
              Secure what the agent
              <br />
              is allowed to do.
            </h1>

            <p className="ae-section-copy">
              Aegisora is a runtime control plane
              for autonomous AI agents. Actions
              pass through a governed execution
              boundary before reaching execution.
            </p>

            <div
              style={{
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
                marginTop: 30,
              }}
            >

              <Link
                href="/proof"
                className="ae-button ae-button-primary"
              >
                Run live runtime proof
              </Link>

              <Link
                href="/developers"
                className="ae-button"
              >
                Developers
              </Link>

            </div>

            <RuntimeCanvas />

          </div>

        </section>

        <section className="ae-section ae-section-white">

          <div className="ae-wrap">

            <div className="ae-eyebrow">
              Execution control
            </div>

            <h2 className="ae-section-title">
              Agent reasoning is not
              <br />
              an authorization system.
            </h2>

            <div
              className="ae-grid-2"
              style={{
                marginTop: 42,
              }}
            >

              {[
                {
                  index: "01",
                  title: "ALLOW",
                  copy:
                    "Permit an action when runtime identity, policy, security and risk checks pass.",
                },
                {
                  index: "02",
                  title: "BLOCK",
                  copy:
                    "Prevent restricted or unauthorized capabilities before execution.",
                },
                {
                  index: "03",
                  title: "ESCALATE",
                  copy:
                    "Move actions requiring review into a controlled human decision path.",
                },
                {
                  index: "04",
                  title: "EVIDENCE",
                  copy:
                    "Keep trace, decision, execution and evidence identity connected.",
                },
              ].map(
                (item) => (
                  <article
                    className="ae-card"
                    key={item.title}
                  >
                    <div className="ae-card-index">
                      {item.index}
                    </div>

                    <h3 className="ae-card-title">
                      {item.title}
                    </h3>

                    <p className="ae-card-copy">
                      {item.copy}
                    </p>
                  </article>
                ),
              )}

            </div>

          </div>

        </section>

      </main>

      <AegisoraFooter />

    </div>
  )
}