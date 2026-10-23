import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/aegisora/logo";
import { SocialIcon } from "@/components/aegisora/social-icon";
import { SOCIALS } from "@/lib/socials";

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
      { label: "Blog", href: "/blog" },
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
    <footer className="dark border-t border-white/10 bg-[#020b2e] text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Runtime security and execution control for autonomous AI agents.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-semibold text-[#0a2a7a] transition hover:bg-white/90"
          >
            Test Aegisora
          </Link>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-sm font-medium text-white">{g.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 transition hover:text-sky-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:px-6">
          <span>Aegisora 4.0. Examples on this site use illustrative sample data.</span>
          <span className="flex gap-5">
            <Link href="/trust/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/impressum" className="hover:text-white">Impressum</Link>
          </span>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-3 px-4 py-6 sm:px-6">
          {SOCIALS.map((s) =>
            s.href ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-sky-300 hover:bg-white/5 hover:text-sky-300"
              >
                <SocialIcon name={s.label} className="size-[18px]" />
              </a>
            ) : (
              <span
                key={s.label}
                aria-label={s.label + " (link not set)"}
                className="inline-flex size-10 cursor-not-allowed items-center justify-center rounded-full border border-white/10 text-white/30"
              >
                <SocialIcon name={s.label} className="size-[18px]" />
              </span>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}