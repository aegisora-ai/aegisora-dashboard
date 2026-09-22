import { AegisoraHeader } from "@/components/aegisora/header"
import { AegisoraFooter } from "@/components/aegisora/footer"

type Section = {
  title: string
  copy: string
}

const sections = [
    {
        "copy":  "Tie actions to a concrete runtime agent identity.",
        "title":  "Canonical identity"
    },
    {
        "copy":  "Deny capabilities outside the permitted execution surface.",
        "title":  "Restricted capabilities"
    },
    {
        "copy":  "Make the authorization decision before execution is attempted.",
        "title":  "Pre-execution enforcement"
    },
    {
        "copy":  "Connect enforcement state with trace and evidence identity.",
        "title":  "Auditable outcome"
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
              Security
            </div>

            <h1 className="ae-section-title">
              Security lives at the execution boundary.
            </h1>

            <p className="ae-section-copy">
              Model safeguards address model behavior. Aegisora addresses what an agent is allowed to do.
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