import Link from "next/link"

const links = [
  {
    label: "Product",
    href: "/product",
  },
  {
    label: "How it works",
    href: "/how-it-works",
  },
  {
    label: "Security",
    href: "/security",
  },
  {
    label: "Enterprise",
    href: "/enterprise",
  },
  {
    label: "Developers",
    href: "/developers",
  },
]

export function AegisoraHeader() {
  return (
    <header className="ae-header">

      <div className="ae-header-inner">

        <Link
          href="/"
          className="ae-brand"
        >
          <span className="ae-brand-mark">
            A
          </span>

          <span className="ae-brand-name">
            AEGISORA
          </span>
        </Link>

        <nav className="ae-nav">

          {links.map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                className="ae-nav-link"
              >
                {link.label}
              </Link>
            ),
          )}

          <Link
            href="/proof"
            className="ae-nav-proof"
          >
            Live proof
          </Link>

          <Link
            href="/login"
            className="ae-nav-login"
          >
            Sign in
          </Link>

        </nav>

      </div>

    </header>
  )
}