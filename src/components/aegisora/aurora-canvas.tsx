"use client";

import { useEffect, useRef } from "react";

type Glow = { x: number; y: number; r: number; sp: number; ph: number; k: number; strong: boolean };
type Dot = { x: number; y: number; vx: number; vy: number };

type AuroraCanvasProps = {
  className?: string;
  /** Faint node network drawn on top of the light. */
  network?: boolean;
  /** 0 to 1.5, scales every alpha. */
  intensity?: number;
};

const FRAME_MS = 1000 / 30;

const GLOWS: Glow[] = [
  { x: 0.14, y: 0.1, r: 0.55, sp: 0.18, ph: 0, k: 1, strong: false },
  { x: 0.88, y: 0.92, r: 0.6, sp: 0.14, ph: 2.1, k: 1, strong: true },
  { x: 0.55, y: 0.5, r: 0.35, sp: 0.1, ph: 4.2, k: 0.4, strong: false },
];

function palette(dark: boolean) {
  return dark
    ? { soft: "21,153,255", strong: "10,95,232", softA: 0.36, strongA: 0.5, dot: "150,200,255", link: "120,180,255" }
    : { soft: "120,180,255", strong: "45,108,240", softA: 0.26, strongA: 0.24, dot: "10,95,232", link: "10,95,232" };
}

/**
 * Two drifting blue lights on the page background (the Aegisora aurora) plus an optional faint node network.
 * Put it inside a `relative` parent. It pauses off screen and when the tab is hidden,
 * draws one still frame for reduced-motion users, and uses fewer nodes on phones.
 */
export function AuroraCanvas({ className = "", network = true, intensity = 1 }: AuroraCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const start0 = performance.now();
    let w = 1;
    let h = 1;
    let raf = 0;
    let last = 0;
    let visible = true;
    let dots: Dot[] = [];

    const setup = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = network ? (narrow.matches ? 22 : 48) : 0;
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const draw = (now: number, move: boolean) => {
      const t = (now - start0) / 1000;
      const p = palette(document.documentElement.classList.contains("dark"));
      const k = Math.max(0, Math.min(1.5, intensity));
      const big = Math.max(w, h);
      ctx.clearRect(0, 0, w, h);

      for (const g of GLOWS) {
        const cx = (g.x + Math.sin(t * g.sp + g.ph) * 0.06) * w;
        const cy = (g.y + Math.cos(t * g.sp * 0.8 + g.ph) * 0.06) * h;
        const rgb = g.strong ? p.strong : p.soft;
        const a = (g.strong ? p.strongA : p.softA) * g.k * k;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, g.r * big);
        grad.addColorStop(0, `rgba(${rgb},${a})`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      if (dots.length === 0) return;
      if (move) {
        for (const d of dots) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0) d.x = w;
          else if (d.x > w) d.x = 0;
          if (d.y < 0) d.y = h;
          else if (d.y > h) d.y = 0;
        }
      }
      const link = narrow.matches ? 90 : 120;
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i += 1) {
        for (let j = i + 1; j < dots.length; j += 1) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link * link) {
            const al = (1 - Math.sqrt(d2) / link) * 0.18 * k;
            ctx.strokeStyle = `rgba(${p.link},${al})`;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = `rgba(${p.dot},${0.55 * k})`;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden || reduce.matches) return;
      if (now - last >= FRAME_MS) {
        last = now;
        draw(now, true);
      }
      raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (reduce.matches) {
        draw(start0, false);
        return;
      }
      if (raf === 0 && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      setup();
      kick();
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      kick();
    });
    const ro = new ResizeObserver(onResize);
    const mo = new MutationObserver(() => {
      if (reduce.matches) kick();
    });
    io.observe(canvas);
    ro.observe(canvas);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    reduce.addEventListener("change", kick);
    document.addEventListener("visibilitychange", kick);

    setup();
    kick();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      reduce.removeEventListener("change", kick);
      document.removeEventListener("visibilitychange", kick);
    };
  }, [network, intensity]);

  return <canvas ref={ref} aria-hidden="true" className={"pointer-events-none absolute inset-0 h-full w-full " + className} />;
}