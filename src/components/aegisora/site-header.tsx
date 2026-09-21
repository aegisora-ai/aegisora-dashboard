"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { btnOutline, btnPrimary, focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

const links = [
  { label: "Runtime", href: "/#runtime" },
  { label: "Decisions", href: "/#outcomes" },
  { label: "Policies", href: "/#policy" },
  { label: "Enterprise", href: "/#enterprise" },
  { label: "Developers", href: "/#developers" },
  { label: "Pricing", href: "/#pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className={cn("text-sm font-semibold tracking-[0.2em]", focusRing)}>
          AEGISORA
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn("hover:text-foreground", focusRing)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/login" className={cn("text-sm text-muted-foreground hover:text-foreground", focusRing)}>
            Log in
          </Link>
          <Link href="/signup" className={cn(btnPrimary, "px-4 py-2")}>
            Test Aegisora
          </Link>
        </div>

        <button
          type="button"
          className={cn("rounded-sm p-2 lg:hidden", focusRing)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-6 pt-2">
            <ul className="divide-y divide-border">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className={cn("block py-3.5 text-base", focusRing)}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mx-auto grid max-w-6xl gap-3 px-6 pb-6 pt-4">
            <Link href="/signup" onClick={() => setOpen(false)} className={btnPrimary}>
              Test Aegisora
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className={btnOutline}>
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}