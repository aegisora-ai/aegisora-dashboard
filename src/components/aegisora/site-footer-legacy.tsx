import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/aegisora/logo";
import { SocialIcon } from "@/components/aegisora/social-icon";
import { SOCIALS } from "@/lib/socials";
import { footerGroups } from "@/lib/main-nav";

export function LegacySiteFooter() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Runtime security and execution control for autonomous AI agents.
          </p>
          <Link
            href="/pilot"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Apply for Enterprise Pilot
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            <Link href="/signup" className="underline-offset-4 hover:text-primary hover:underline">
              Or create a test workspace
            </Link>
          </p>
        </div>
        {footerGroups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-sm font-medium text-foreground">{g.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-muted-foreground transition hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>Aegisora 4.0. Examples on this site use illustrative sample data.</span>
          <span className="flex gap-5">
            <Link href="/trust/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/impressum" className="hover:text-foreground">
              Impressum
            </Link>
          </span>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-3 px-4 py-6 sm:px-6">
          {SOCIALS.map((s) =>
            s.href ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <SocialIcon name={s.label} className="size-[18px]" />
              </a>
            ) : (
              <span
                key={s.label}
                aria-label={s.label + " (link not set)"}
                className="inline-flex size-10 cursor-not-allowed items-center justify-center rounded-full border border-border text-muted-foreground/40"
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