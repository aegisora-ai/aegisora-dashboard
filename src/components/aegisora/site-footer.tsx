import Link from "next/link";
import { Logo } from "@/components/aegisora/logo";
import { footerGroups } from "@/lib/site-nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-1">
      <div className="mx-auto grid max-w-[80rem] gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Runtime security and execution control for autonomous AI agents.
          </p>
        </div>
        {footerGroups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{g.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-cyan">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[80rem] px-6 py-5 text-xs text-muted-foreground">
          Aegisora 3.0. Examples on this site use illustrative sample data.
        </div>
      </div>
    </footer>
  );
}