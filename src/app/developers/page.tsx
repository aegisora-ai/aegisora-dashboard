import Link from "next/link"

import { ArrowRight } from "lucide-react"

import { AegisoraLogo } from "@/components/aegisora/logo"

const cards = [
    {
        "title":  "Framework independent",
        "copy":  "The boundary sits beneath your agent stack.",
        "index":  "01"
    },
    {
        "title":  "Provider aware",
        "copy":  "Provider execution can pass through the same enforcement path.",
        "index":  "02"
    },
    {
        "title":  "Deterministic results",
        "copy":  "Use explicit ALLOW, BLOCK and ESCALATE states.",
        "index":  "03"
    },
    {
        "title":  "Runtime evidence",
        "copy":  "Carry decision and evidence identity downstream.",
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
            DEVELOPERS
          </span>

          <h1>
            Build agents around a real enforcement boundary.
          </h1>

          <p>
            Aegisora is designed to sit underneath the agent orchestration layer, where requests become executable actions.
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