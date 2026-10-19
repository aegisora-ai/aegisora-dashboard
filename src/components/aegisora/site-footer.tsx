import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/aegisora/logo";

type FooterLink = { label: string; href: string };

const GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Runtime", href: "/product/runtime" },
      { label: "Policies", href: "/product/policies" },
      { label: "Decisions", href: "/product/decisions" },
      { label: "Approvals", href: "/product/approvals" },
      { label: "Evidence", href: "/product/evidence" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Overview", href: "/developers" },
      { label: "Quickstart", href: "/developers/quickstart" },
      { label: "Docs", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", href: "/security" },
      { label: "Trust center", href: "/trust" },
      { label: "Proof", href: "/proof" },
      { label: "Privacy", href: "/trust/privacy" },
      { label: "Subprocessors", href: "/trust/subprocessors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Enterprise", href: "/enterprise" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Impressum", href: "/impressum" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#0f2a5c] bg-[#000b24] text-[#f4f8ff]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a9bbdb]">
            Runtime security and execution control for autonomous AI agents.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex h-10 items-center rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
          >
            Test Aegisora
          </Link>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8fa4cc]">{g.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#dbe6ff] transition hover:text-white hover:underline underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[#0f2a5c]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-[#8fa4cc] sm:px-6">
          <span>Aegisora 4.0. Examples on this site use illustrative sample data.</span>
          <span className="flex gap-5">
            <Link href="/trust/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/impressum" className="hover:text-white">Impressum</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}