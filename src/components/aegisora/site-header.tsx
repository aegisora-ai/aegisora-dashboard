"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { ThemeToggle } from "@/components/aegisora/theme-toggle";
import { SOCIALS } from "@/lib/socials";
import { announcement, headerCtas, mainNav } from "@/lib/main-nav";
import { supportsLight } from "@/lib/theme";

const GITHUB_URL = SOCIALS.find((s) => s.label === "GitHub")?.href ?? "";

const navLink = "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
const btnPrimary =
  "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const lightOk = supportsLight(pathname);

  useEffect(() => {
    const t = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="border-b border-border bg-surface-1 text-foreground">
        <div className="mx-auto flex min-h-10 max-w-[1280px] items-center justify-center gap-3 px-4 py-2 text-sm sm:px-6">
          <span className="hidden rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline">
            {announcement.badge}
          </span>
          <span className="text-muted-foreground">{announcement.text}</span>
          <Link
            href={announcement.href}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
          >
            {announcement.label} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-[100] w-full border-b border-border bg-background/85 text-foreground backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {mainNav.map((entry) =>
                entry.items ? (
                  <div key={entry.label} className="group relative">
                    <Link
                      href={entry.href}
                      aria-haspopup="true"
                      aria-current={isActive(pathname, entry.href) ? "page" : undefined}
                      className={
                        "flex items-center gap-1 rounded-md px-3 py-1.5 " +
                        navLink +
                        (isActive(pathname, entry.href) ? " text-foreground" : "")
                      }
                    >
                      {entry.label}
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180"
                      />
                    </Link>
                    <div className="invisible absolute left-0 top-full z-50 w-80 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="rounded-xl border border-border bg-popover p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                        {entry.items.map((item) => (
                          <li key={item.href + item.label}>
                            <Link href={item.href} className="block rounded-lg p-2.5 transition hover:bg-accent">
                              <span className="block text-[15px] font-medium text-foreground">{item.label}</span>
                              {item.desc ? (
                                <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{item.desc}</span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={entry.label}
                    href={entry.href}
                    aria-current={isActive(pathname, entry.href) ? "page" : undefined}
                    className={
                      "rounded-md px-3 py-1.5 " + navLink + (isActive(pathname, entry.href) ? " text-foreground" : "")
                    }
                  >
                    {entry.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-4 lg:flex">
              {lightOk ? <ThemeToggle /> : null}
              {GITHUB_URL ? (
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                >
                  GitHub
                </a>
              ) : null}
              <Link href={headerCtas.login.href} className={navLink}>
                {headerCtas.login.label}
              </Link>
              <Link href={headerCtas.primary.href} className={btnPrimary}>
                {headerCtas.primary.label}
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border p-2 text-foreground transition-colors hover:border-primary focus:outline-none lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-background px-6 pb-10 pt-28 text-foreground lg:hidden">
          <nav className="flex flex-col">
            {mainNav.map((entry) => (
              <div key={entry.label} className="border-b border-border py-3">
                <Link href={entry.href} className="block py-1 text-lg font-medium text-foreground">
                  {entry.label}
                </Link>
                {entry.items ? (
                  <ul className="mt-1 space-y-0.5">
                    {entry.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} className="block rounded-md px-2 py-1.5 text-base text-muted-foreground hover:bg-accent">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <Link href={headerCtas.login.href} className="py-3 text-lg font-medium text-foreground">
              {headerCtas.login.label}
            </Link>
            <Link
              href={headerCtas.primary.href}
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary text-base font-medium text-primary-foreground"
            >
              {headerCtas.primary.label}
            </Link>
            {lightOk ? (
              <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                <span>Theme</span>
                <ThemeToggle />
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  );
}