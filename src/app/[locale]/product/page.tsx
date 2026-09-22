import { AegisoraHeader } from "@/components/aegisora/header"
import { AegisoraFooter } from "@/components/aegisora/footer"

type Section = {
  title: string
  copy: string
}

const sections = [
    {
        "copy":  "Evaluate an action before it reaches the execution layer.",
        "title":  "Execution boundary"
    },
    {
        "copy":  "Define what an agent may execute and enforce those rules at runtime.",
        "title":  "Policy enforcement"
    },
    {
        "copy":  "Return an explicit ALLOW, BLOCK or ESCALATE decision.",
        "title":  "Decision engine"
    },
    {
        "copy":  "Keep decision, execution and evidence identifiers connected.",
        "title":  "Evidence identity"
    }
] as Section[]

export default function AegisoraPage() {
  return (
    <div className="ae-page">
      <AegisoraHeader />

      <main>

        <section className="ae-section">
          <div className="ae-wrap">

            <div className="ae-eyebrow">
              Product
            </div>

            <h1 className="ae-section-title">
              Control the agent action, not just the model output.
            </h1>

            <p className="ae-section-copy">
              Aegisora provides the runtime control plane between agent intent and execution.
            </p>

          </div>
        </section>

        <section className="ae-section ae-section-white">
          <div className="ae-wrap">

            <div className="ae-grid-2">

              {sections.map(
                (section) => (
                  <article
                    className="ae-card"
                    key={section.title}
                  >
                    <div className="ae-card-index">
                      {section.title}
                    </div>

                    <h2 className="ae-card-title">
                      {section.title}
                    </h2>

                    <p className="ae-card-copy">
                      {section.copy}
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