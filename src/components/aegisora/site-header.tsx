"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { SOCIALS } from "@/lib/socials";
import { announcement, headerCtas, mainNav } from "@/lib/main-nav";

// Bos birakirsan GitHub dugmesi gorunmez. Repo adresini SOCIALS icine yazinca otomatik cikar.
const GITHUB_URL = SOCIALS.find((s) => s.label === "GitHub")?.href ?? "";

const navLink = "text-sm font-medium text-white/70 transition-colors hover:text-white";
const btnPrimary =
  "inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-[#0a2a7a] transition hover:bg-white/90";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Route change intentionally closes the mobile menu.
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
      <div className="dark border-b border-white/10 bg-[#031249] text-white">
        <div className="mx-auto flex min-h-10 max-w-[1280px] items-center justify-center gap-3 px-4 py-2 text-sm sm:px-6">
          <span className="hidden rounded border border-white/20 bg-white/5 px-2 py-0.5 text-xs font-medium text-white/80 sm:inline">
            {announcement.badge}
          </span>
          <span className="text-white/70">{announcement.text}</span>
          <Link
            href={announcement.href}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-sky-300 underline-offset-4 hover:underline"
          >
            {announcement.label} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <header className="dark sticky top-0 z-[100] w-full border-b border-white/10 bg-[#020b2e]/85 text-white backdrop-blur">
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
                        (isActive(pathname, entry.href) ? " text-white" : "")
                      }
                    >
                      {entry.label}
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180"
                      />
                    </Link>
                    <div className="invisible absolute left-0 top-full z-50 w-80 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="rounded-xl border border-white/10 bg-[#031249] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {entry.items.map((item) => (
                          <li key={item.href + item.label}>
                            <Link href={item.href} className="block rounded-lg p-2.5 transition hover:bg-white/5">
                              <span className="block text-[15px] font-medium text-white">{item.label}</span>
                              {item.desc ? (
                                <span className="mt-0.5 block text-sm leading-snug text-white/60">{item.desc}</span>
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
                      "rounded-md px-3 py-1.5 " + navLink + (isActive(pathname, entry.href) ? " text-white" : "")
                    }
                  >
                    {entry.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-5 lg:flex">
              {GITHUB_URL ? (
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-md border border-white/25 px-3 text-sm font-medium text-white transition hover:bg-white/10"
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
              className="inline-flex items-center justify-center rounded-md border border-white/25 p-2 text-white transition-colors hover:bg-white/10 focus:outline-none lg:hidden"
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
        <div className="dark fixed inset-0 z-[90] overflow-y-auto bg-[#020b2e] px-6 pb-10 pt-28 text-white lg:hidden">
          <nav className="flex flex-col">
            {mainNav.map((entry) => (
              <div key={entry.label} className="border-b border-white/10 py-3">
                <Link href={entry.href} className="block py-1 text-lg font-medium text-white">
                  {entry.label}
                </Link>
                {entry.items ? (
                  <ul className="mt-1 space-y-0.5">
                    {entry.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} className="block rounded-md px-2 py-1.5 text-base text-white/70 hover:bg-white/5">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <Link href={headerCtas.login.href} className="py-3 text-lg font-medium text-white">
              {headerCtas.login.label}
            </Link>
            <Link
              href={headerCtas.primary.href}
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-white text-base font-medium text-[#0a2a7a]"
            >
              {headerCtas.primary.label}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}