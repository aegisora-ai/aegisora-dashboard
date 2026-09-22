import Link from "next/link"

import { ArrowRight } from "lucide-react"

import { AegisoraLogo } from "@/components/aegisora/logo"

const cards = [
    {
        "title":  "Execution boundary",
        "copy":  "Evaluate the action before execution.",
        "index":  "01"
    },
    {
        "title":  "Decision engine",
        "copy":  "Return ALLOW, BLOCK or ESCALATE.",
        "index":  "02"
    },
    {
        "title":  "Enforcement",
        "copy":  "Prevent restricted capabilities from crossing the boundary.",
        "index":  "03"
    },
    {
        "title":  "Evidence",
        "copy":  "Carry trace, decision, execution and evidence identity.",
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
            PRODUCT
          </span>

          <h1>
            Control what the agent is allowed to do.
          </h1>

          <p>
            Aegisora provides an execution-boundary control plane where identity, policy, security and risk become an explicit runtime decision.
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