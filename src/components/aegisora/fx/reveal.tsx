"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: boolean;
};

export function Reveal({ children, className, delay = 0, y = 28, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? Array.from(el.children) : [el];
        gsap.from(targets, {
          y,
          opacity: 0,
          duration: 0.8,
          delay,
          ease: "power3.out",
          stagger: stagger ? 0.09 : 0,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}