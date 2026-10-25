"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleHelp, Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/theme";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

const btn = "inline-flex size-9 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-surface-3 hover:text-foreground";

export function TopbarActions() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setDark(document.documentElement.classList.contains("dark")), 0);
    return () => window.clearTimeout(t);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { window.localStorage.setItem(THEME_KEY, next ? "dark" : "light"); } catch {}
  }

  return (
    <>
      <span className="hidden sm:inline-flex">
        <Link href="/support" aria-label="Help center" className={cn(btn, focusRing)}>
          <CircleHelp className="size-4" />
        </Link>
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        className={cn(btn, focusRing)}
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </>
  );
}