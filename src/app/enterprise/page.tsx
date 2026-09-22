import Link from "next/link"

import { ArrowRight } from "lucide-react"

import { AegisoraLogo } from "@/components/aegisora/logo"

const cards = [
    {
        "title":  "Standard mode",
        "copy":  "Fast operational visibility for everyday users.",
        "index":  "01"
    },
    {
        "title":  "Professional mode",
        "copy":  "Trace, risk, evidence and control details for technical teams.",
        "index":  "02"
    },
    {
        "title":  "Tenant scoped workspace",
        "copy":  "Organization-aware runtime records and access.",
        "index":  "03"
    },
    {
        "title":  "Human review",
        "copy":  "Escalated actions become explicit approval records.",
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
            ENTERPRISE
          </span>

          <h1>
            A control plane for governed agent execution.
          </h1>

          <p>
            Give teams the operational surfaces they need without filling the product with invented metrics or fake enterprise claims.
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