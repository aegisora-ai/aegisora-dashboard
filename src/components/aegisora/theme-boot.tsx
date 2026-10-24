"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { THEME_KEY, supportsLight } from "@/lib/theme";

/** Applies the saved theme on pages that support light mode, navy everywhere else. */
export function ThemeBoot() {
  const pathname = usePathname();
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {}
    const dark = !(supportsLight(pathname) && stored === "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [pathname]);
  return null;
}