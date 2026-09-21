"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount aninda gercek DOM durumu ile senkronizasyon (hydration-safe)
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("aeg-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground",
        focusRing,
        className,
      )}
    >
      {ready && dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}