"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

const TARGETS = ".aegx-cell, .aegx-plan, .aegx-feed, .aegx-sh, .aegx-faq details, .aegx-band, .aegx-form, .aegx-done";

/** Scroll-reveal and cursor glow for the aegx pages. Content stays visible when JS or motion is unavailable. */
export function AegxFx() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".aegx");
    if (!root) return undefined;
    root.classList.add("aegx-js");
    const els = Array.from(root.querySelectorAll<HTMLElement>(TARGETS));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | null = null;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              (en.target as HTMLElement).classList.add("is-in");
              io?.unobserve(en.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
      );
      els.forEach((el, i) => {
        el.setAttribute("data-rv", "");
        el.style.setProperty("--rv-d", (i % 4) * 70 + "ms");
        io?.observe(el);
      });
    }
    const onMove = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const c = t?.closest<HTMLElement>(".aegx-cell");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io?.disconnect();
      root.removeEventListener("pointermove", onMove);
    };
  }, [pathname]);

  return null;
}