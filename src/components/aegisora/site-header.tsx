"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/aegisora/logo";
import { ThemeToggle } from "@/components/aegisora/theme-toggle";
import { nav } from "@/lib/site-nav";
import { btnOutline, btnPrimary, focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const barRef = useRef<HTMLDivElement>(null);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenMenu(null);
    setMobile(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobile(false);
      }
    }
    function onDown(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, []);

  const isActive = (href?: string) => Boolean(href) && (pathname === href || pathname.startsWith(href + "/"));

  const trigger = "inline-flex items-center gap-1 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div ref={barRef} className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Aegisora home" className={focusRing}>
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {nav.map((g) =>
              g.items ? (
                <div
                  key={g.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(g.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    aria-expanded={openMenu === g.label}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(openMenu === g.label ? null : g.label)}
                    className={cn(trigger, g.items.some((i) => isActive(i.href)) && "text-foreground", focusRing)}
                  >
                    {g.label}
                    <ChevronDown className={cn("size-3.5 transition-transform", openMenu === g.label && "rotate-180")} />
                  </button>
                  {openMenu === g.label && (
                    <div className="absolute left-0 top-full pt-2">
                      <ul className="aeg-panel w-[380px] p-2">
                        {g.items.map((i) => (
                          <li key={i.href}>
                            <Link
                              href={i.href}
                              className={cn("block rounded-sm px-3 py-2.5 transition-colors hover:bg-surface-3", focusRing)}
                            >
                              <span className="block text-sm font-medium">{i.label}</span>
                              {i.desc && <span className="block text-xs text-muted-foreground">{i.desc}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={g.label}
                  href={g.href ?? "/"}
                  aria-current={isActive(g.href) ? "page" : undefined}
                  className={cn(trigger, isActive(g.href) && "text-foreground", focusRing)}
                >
                  {g.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link href="/login" className={cn("px-2 text-sm text-muted-foreground hover:text-foreground", focusRing)}>
            Log in
          </Link>
          <Link href="/signup" className={cn(btnPrimary, "px-4 py-2")}>
            Test Aegisora
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className={cn("inline-flex size-9 items-center justify-center rounded-sm border border-border", focusRing)}
            aria-expanded={mobile}
            aria-controls="mobile-menu"
            aria-label={mobile ? "Close menu" : "Open menu"}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {mobile && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-background lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-6 py-4">
            {nav.map((g) => (
              <div key={g.label} className="border-b border-border py-3">
                {g.items ? (
                  <>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                      {g.label.toUpperCase()}
                    </div>
                    <ul>
                      {g.items.map((i) => (
                        <li key={i.href}>
                          <Link href={i.href} className={cn("block py-2.5 text-base", focusRing)}>
                            {i.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link href={g.href ?? "/"} className={cn("block py-1.5 text-base", focusRing)}>
                    {g.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="grid gap-3 pt-6">
              <Link href="/signup" className={btnPrimary}>Test Aegisora</Link>
              <Link href="/login" className={btnOutline}>Log in</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}