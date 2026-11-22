"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "@/i18n/navigation";
import { isDarkTheme, THEME_KEY } from "@/lib/theme";

gsap.registerPlugin(ScrollTrigger);

const HERO_SEL = ".zp-hero .zp-eyebrow, .zp-hero h1, .zp-hero .zp-hxl, .zp-hero .zp-h2xl, .zp-hero .zp-lead, .zp-hero .zp-btn-row, .zpk-hero .zp-eyebrow, .zpk-hero h1, .zpk-hero .zpk-typed, .zpk-hero .zpk-lead, .zpk-hero .zpk-actions, .zpk-hero .zpk-art";
const HEAD_SEL = ".zp-h2xl, .zp-hlg, .zp-eyebrow, .zp-lead, .zp-quote blockquote, .zpk-h2, .zpk-sub";
const CELL_SEL = ".zp-lines > *, .zp-cap, .zp-step, .zp-sec-cell, .zp-tab, .zp-acc-item, .zp-chip, .zp-mock-row, .zp-footer-grid > *, .zpk-card, .zpk-tablewrap, .zpk-faq details, .zpk-darkpanel";
const BLOCK_SEL = ".zp-compare, .zp-controls, .zp-mock, .zp-code, .zp-cta .zp-btn-row, .zpk-cta .zpk-actions, .zpk-ctabox";

function pick(sel: string, exclude?: Set<Element>): HTMLElement[] {
  return gsap.utils.toArray<HTMLElement>(sel).filter((el) => !exclude || !exclude.has(el));
}

/** Zapier tarzi hareket katmani. Hareket azaltma ayari acik olan kullanicilarda calismaz. */
export function ZpMotion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    // Tema: destekli sayfada kayitli tercih, digerlerinde koyu.
    try {
      const s = localStorage.getItem(THEME_KEY);
      document.documentElement.classList.toggle("dark", isDarkTheme(pathname, s));
    } catch {
      /* storage unavailable */
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const used = new Set<Element>();

      // Acilis: hero
      const hero = pick(HERO_SEL);
      hero.forEach((el) => used.add(el));
      if (hero.length) {
        gsap.from(hero, { y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, clearProps: "transform,opacity" });
      }

      // Kaydirma: basliklar
      const heads = pick(HEAD_SEL, used);
      heads.forEach((el) => used.add(el));
      if (heads.length) {
        gsap.set(heads, { y: 24, opacity: 0 });
        ScrollTrigger.batch(heads, {
          start: "top 90%",
          once: true,
          onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform,opacity" }),
        });
      }

      // Kaydirma: hucreler, kartlar, satirlar
      const cells = pick(CELL_SEL, used);
      cells.forEach((el) => used.add(el));
      if (cells.length) {
        gsap.set(cells, { y: 28, opacity: 0 });
        ScrollTrigger.batch(cells, {
          start: "top 92%",
          once: true,
          onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out", stagger: 0.07, overwrite: true, clearProps: "transform,opacity" }),
        });
      }

      // Kaydirma: buyuk bloklar
      pick(BLOCK_SEL, used).forEach((el) => {
        gsap.from(el, {
          y: 40, opacity: 0, scale: 0.985, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // Derinlik: gorsel alanlar
      pick(".zp-art").forEach((el) => {
        gsap.fromTo(el, { y: 20 }, {
          y: -20, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        });
      });

      // Header: kayinca golge
      ScrollTrigger.create({
        start: 8,
        end: "max",
        toggleClass: { targets: ".zp-header", className: "is-scrolled" },
      });
    });

    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(t);
      mm.revert();
    };
  }, [pathname]);

  return null;
}