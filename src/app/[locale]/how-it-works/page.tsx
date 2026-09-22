import { AegisoraHeader } from "@/components/aegisora/header"
import { AegisoraFooter } from "@/components/aegisora/footer"

type Section = {
  title: string
  copy: string
}

const sections = [
    {
        "copy":  "Receive the intended capability and action.",
        "title":  "Request"
    },
    {
        "copy":  "Resolve the runtime identity and relevant execution state.",
        "title":  "Context"
    },
    {
        "copy":  "Evaluate policy, permission, security and risk.",
        "title":  "Policy + risk"
    },
    {
        "copy":  "Return an explicit enforcement decision.",
        "title":  "Decision"
    },
    {
        "copy":  "Allow only the action that crossed the boundary.",
        "title":  "Execution"
    },
    {
        "copy":  "Connect the lifecycle to trace and evidence identity.",
        "title":  "Evidence"
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
              Architecture
            </div>

            <h1 className="ae-section-title">
              Request. Context. Policy. Risk. Decision. Execution. Evidence.
            </h1>

            <p className="ae-section-copy">
              Aegisora places an explicit governed control path between an agent request and execution.
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