"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; vx: number; vy: number };
type Packet = { a: number; b: number; t: number; c: string };

const LINK = 130;
const VERDICTS = ["52,211,153", "251,191,36", "248,113,113"];

export function HeroCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let pts: Pt[] = [];
    let packets: Packet[] = [];
    let visible = true;
    let running = false;

    const setup = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(14, Math.min(64, Math.round((w * h) / 17000)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
      packets = [];
    };

    const spawn = () => {
      if (pts.length < 2) return;
      const a = Math.floor(Math.random() * pts.length);
      let best = -1;
      let bd = LINK;
      for (let b = 0; b < pts.length; b++) {
        if (b === a) continue;
        const d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
        if (d < bd) { bd = d; best = b; }
      }
      if (best >= 0) packets.push({ a, b: best, t: 0, c: VERDICTS[Math.floor(Math.random() * VERDICTS.length)] });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!reduce) {
        for (const p of pts) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
      }
      ctx.lineWidth = 1;
      for (let a = 0; a < pts.length; a++) {
        for (let b = a + 1; b < pts.length; b++) {
          const d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
          if (d < LINK) {
            ctx.strokeStyle = "rgba(190,225,255," + (0.16 * (1 - d / LINK)).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(210,235,255,0.55)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const k of packets) {
        const A = pts[k.a];
        const B = pts[k.b];
        ctx.fillStyle = "rgba(" + k.c + ",0.95)";
        ctx.beginPath();
        ctx.arc(A.x + (B.x - A.x) * k.t, A.y + (B.y - A.y) * k.t, 2.3, 0, Math.PI * 2);
        ctx.fill();
        k.t += 0.02;
      }
      packets = packets.filter((k) => k.t < 1);
    };

    const loop = (ts: number) => {
      if (!visible || document.hidden) { running = false; return; }
      if (ts - last > 1100 && packets.length < 4) { last = ts; spawn(); }
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce || running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    setup();
    draw();
    start();
    const ro = new ResizeObserver(() => { setup(); draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); });
    io.observe(canvas);
    const onVis = () => { if (!document.hidden) start(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={"block h-full w-full " + className} />;
}