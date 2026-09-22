import { AegisoraHeader } from "@/components/aegisora/header"
import { AegisoraFooter } from "@/components/aegisora/footer"

type Section = {
  title: string
  copy: string
}

const sections = [
    {
        "copy":  "Control is placed where intent becomes execution.",
        "title":  "Runtime first"
    },
    {
        "copy":  "Operational claims should map back to runtime records.",
        "title":  "Evidence led"
    },
    {
        "copy":  "The runtime is built around transparent execution controls.",
        "title":  "Open engineering"
    },
    {
        "copy":  "The control plane can evolve into tenant-aware workflows.",
        "title":  "Enterprise path"
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
              Company
            </div>

            <h1 className="ae-section-title">
              Aegisora exists to make agent execution governable.
            </h1>

            <p className="ae-section-copy">
              The product is built around an explicit execution boundary for autonomous agent capabilities.
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