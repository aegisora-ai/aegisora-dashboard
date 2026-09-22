import Link from "next/link"

export function AegisoraFooter() {
  return (
    <footer className="ae-footer">

      <div className="ae-wrap">

        <div className="ae-footer-grid">

          <div>

            <div className="ae-eyebrow">
              AEGISORA
            </div>

            <div className="ae-footer-title">
              Runtime security and governance
              for autonomous AI agents.
            </div>

            <p className="ae-footer-copy">
              Control what the agent is allowed
              to do at the execution boundary.
            </p>

          </div>

          <div>

            <div className="ae-footer-label">
              Product
            </div>

            <Link href="/product">
              Product
            </Link>

            <Link href="/security">
              Security
            </Link>

            <Link href="/evidence">
              Evidence
            </Link>

          </div>

          <div>

            <div className="ae-footer-label">
              Company
            </div>

            <Link href="/enterprise">
              Enterprise
            </Link>

            <Link href="/about">
              About
            </Link>

            <Link href="/contact">
              Contact
            </Link>

          </div>

          <div>

            <div className="ae-footer-label">
              Developers
            </div>

            <Link href="/developers">
              Developers
            </Link>

            <Link href="/how-it-works">
              Architecture
            </Link>

            <Link href="/proof">
              Live proof
            </Link>

          </div>

        </div>

        <div className="ae-footer-bottom">

          <span>
            © {new Date().getFullYear()} Aegisora
          </span>

          <span>
            ALLOW / BLOCK / ESCALATE
          </span>

        </div>

      </div>

    </footer>
  )
}