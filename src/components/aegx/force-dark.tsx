"use client";

import { useEffect } from "react";

/** The rebuilt site is dark only: keep the dark class while it is mounted, then restore. */
export function ForceDark() {
  useEffect(() => {
    const root = document.documentElement;
    const had = root.classList.contains("dark");
    root.classList.add("dark");
    const mo = new MutationObserver(() => {
      if (!root.classList.contains("dark")) root.classList.add("dark");
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      if (!had) root.classList.remove("dark");
    };
  }, []);
  return null;
}