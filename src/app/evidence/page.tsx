import Link from "next/link"

import { ArrowRight } from "lucide-react"

import { AegisoraLogo } from "@/components/aegisora/logo"

const cards = [
    {
        "title":  "Trace",
        "copy":  "Follow the request through the runtime.",
        "index":  "01"
    },
    {
        "title":  "Decision",
        "copy":  "Identify the enforcement result.",
        "index":  "02"
    },
    {
        "title":  "Execution",
        "copy":  "Know which execution boundary the decision controlled.",
        "index":  "03"
    },
    {
        "title":  "Evidence",
        "copy":  "Anchor the lifecycle to an auditable record.",
        "index":  "04"
    }
]

export default function PublicSupportPage() {
  return (
    <div className="ae-public">

      <header className="ae-public-header">

        <AegisoraLogo />

        <nav>

          <Link href="/">
            Home
          </Link>

          <Link href="/product">
            Product
          </Link>

          <Link href="/security">
            Security
          </Link>

          <Link href="/enterprise">
            Enterprise
          </Link>

          <Link href="/developers">
            Developers
          </Link>

          <Link href="/dashboard">
            Control plane
          </Link>

        </nav>

      </header>

      <main>

        <section className="ae-public-support-hero">

          <span>
            EVIDENCE
          </span>

          <h1>
            Every controlled action should leave an identity trail.
          </h1>

          <p>
            Aegisora links the decision lifecycle to trace, execution and evidence identifiers.
          </p>

        </section>

        <section className="ae-public-white">

          <div className="ae-public-feature-grid">

            {cards.map((card) => (
              <article
                className="ae-public-feature"
                key={card.title}
              >

                <span>
                  {card.index}
                </span>

                <h3>
                  {card.title}
                </h3>

                <p>
                  {card.copy}
                </p>

              </article>
            ))}

          </div>

          <div className="ae-public-inline-cta">

            <Link
              href="/proof"
              className="ae-public-primary"
            >
              Run live runtime proof
              <ArrowRight size={14} />
            </Link>

          </div>

        </section>

      </main>

      <footer className="ae-public-footer">

        <AegisoraLogo compact />

        <span>
          Aegisora 3.0
        </span>

      </footer>

    </div>
  )
}