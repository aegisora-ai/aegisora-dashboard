import { AegisoraHeader } from "@/components/aegisora/header"
import { AegisoraFooter } from "@/components/aegisora/footer"

type Section = {
  title: string
  copy: string
}

const sections = [
    {
        "copy":  "Follow an action through the runtime lifecycle.",
        "title":  "Trace identity"
    },
    {
        "copy":  "Identify the exact enforcement decision.",
        "title":  "Decision identity"
    },
    {
        "copy":  "Connect the decision to execution.",
        "title":  "Execution identity"
    },
    {
        "copy":  "Anchor the runtime record with an evidence identifier.",
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
              Evidence
            </div>

            <h1 className="ae-section-title">
              A decision should leave an evidence trail.
            </h1>

            <p className="ae-section-copy">
              Aegisora links decision, trace, execution and evidence identity.
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