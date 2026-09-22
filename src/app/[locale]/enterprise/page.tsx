import { AegisoraHeader } from "@/components/aegisora/header"
import { AegisoraFooter } from "@/components/aegisora/footer"

type Section = {
  title: string
  copy: string
}

const sections = [
    {
        "copy":  "Centralize runtime control and operational visibility.",
        "title":  "Workspace"
    },
    {
        "copy":  "Manage canonical identities connected to execution.",
        "title":  "Agents"
    },
    {
        "copy":  "Define rules governing agent capabilities.",
        "title":  "Policies"
    },
    {
        "copy":  "Route escalated actions into human review.",
        "title":  "Approvals"
    },
    {
        "copy":  "Expose structured runtime records for enterprise workflows.",
        "title":  "Audit"
    },
    {
        "copy":  "Retain linked decision, execution and evidence identifiers.",
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
              Enterprise
            </div>

            <h1 className="ae-section-title">
              A control plane for governed agent execution.
            </h1>

            <p className="ae-section-copy">
              Build a tenant-scoped operational layer around agents, policies, approvals, decisions, evidence and audit workflows.
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