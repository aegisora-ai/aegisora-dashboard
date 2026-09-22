import { AegisoraHeader } from "@/components/aegisora/header"
import { AegisoraFooter } from "@/components/aegisora/footer"

type Section = {
  title: string
  copy: string
}

const sections = [
    {
        "copy":  "The runtime boundary can sit beneath the orchestration layer.",
        "title":  "Framework independent"
    },
    {
        "copy":  "Provider execution can pass through the same enforcement lifecycle.",
        "title":  "Provider aware"
    },
    {
        "copy":  "Expose explicit decision states rather than implicit authorization.",
        "title":  "Deterministic decisions"
    },
    {
        "copy":  "Carry runtime identifiers into downstream operational systems.",
        "title":  "Operational evidence"
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
              Developers
            </div>

            <h1 className="ae-section-title">
              Build agents around a real enforcement boundary.
            </h1>

            <p className="ae-section-copy">
              Integrate Aegisora where agent intent becomes an executable action.
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