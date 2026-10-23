"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function subscribe(cb: () => void) {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => o.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle({ floating = false, className }: { floating?: boolean; className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("aeg-theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary",
        floating && "fixed bottom-4 right-4 z-[55] size-10 rounded-full shadow-lg",
        className,
      )}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}