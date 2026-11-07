"use client";

import { useEffect, useRef } from "react";

type Blob = { c: string; r: number; sx: number; sy: number; px: number; py: number; ax: number; ay: number; cx: number; cy: number; a: number };

const BLOBS: Blob[] = [
  { c: "214,70,160", r: 0.62, sx: 0.00021, sy: 0.00017, px: 0.0, py: 1.3, ax: 0.1, ay: 0.06, cx: 0.14, cy: 0.9, a: 0.62 },
  { c: "40,90,255", r: 0.7, sx: 0.00017, sy: 0.00023, px: 2.1, py: 0.4, ax: 0.12, ay: 0.05, cx: 0.4, cy: 0.98, a: 0.72 },
  { c: "255,186,70", r: 0.58, sx: 0.00025, sy: 0.00015, px: 4.0, py: 2.2, ax: 0.1, ay: 0.06, cx: 0.72, cy: 0.94, a: 0.6 },
  { c: "70,210,255", r: 0.5, sx: 0.00019, sy: 0.00027, px: 1.1, py: 3.3, ax: 0.08, ay: 0.08, cx: 0.92, cy: 0.78, a: 0.45 },
  { c: "138,77,255", r: 0.6, sx: 0.00023, sy: 0.00019, px: 3.2, py: 5.1, ax: 0.14, ay: 0.06, cx: 0.55, cy: 0.88, a: 0.5 },
];

/** Soft animated aurora on a small canvas. Pauses off-screen and respects reduced motion. */
export function AegxAurora({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const ctx = cv.getContext("2d");
    if (!ctx) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCALE = 0.4;
    let w = 2;
    let h = 2;
    let raf = 0;
    let last = 0;
    let visible = true;

    const size = () => {
      const r = cv.getBoundingClientRect();
      w = Math.max(2, Math.round(r.width * SCALE));
      h = Math.max(2, Math.round(r.height * SCALE));
      cv.width = w;
      cv.height = h;
    };

    const draw = (t: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of BLOBS) {
        const x = (b.cx + Math.sin(t * b.sx + b.px) * b.ax) * w;
        const y = (b.cy + Math.cos(t * b.sy + b.py) * b.ay) * h;
        const rad = b.r * Math.max(w, h) * 0.75;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, "rgba(" + b.c + "," + (b.a * intensity).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + b.c + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || t - last < 33) return;
      last = t;
      draw(t);
    };

    size();
    draw(0);
    const ro = new ResizeObserver(() => { size(); draw(last); });
    ro.observe(cv);
    let io: IntersectionObserver | null = null;
    if (!reduce) {
      io = new IntersectionObserver((entries) => { visible = entries.some((e) => e.isIntersecting); });
      io.observe(cv);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
    };
  }, [intensity]);

  return <canvas ref={ref} aria-hidden="true" />;
}