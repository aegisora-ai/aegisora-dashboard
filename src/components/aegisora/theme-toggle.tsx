"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const [ready] = useState(true);

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