"use client";

import { useEffect, useRef } from "react";

type Verdict = "allow" | "block" | "escalate";
type State = "in" | "hold" | "burst" | "out";
type Particle = { x: number; lane: number; speed: number; verdict: Verdict; state: State; t: number };

const LANES = 6;
const MAX_PARTICLES = 40;
const RGB = { base: "0,177,253", allow: "47,208,138", block: "255,93,108", escalate: "255,184,77" } as const;

export function DecisionCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const parts: Particle[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let inView = true;

    const gateX = () => w * 0.56;
    const laneY = (i: number) => h * (0.14 + 0.72 * (i / (LANES - 1)));

    const spawn = (x = -10) => {
      if (parts.length >= MAX_PARTICLES) return;
      const r = Math.random();
      const verdict: Verdict = r < 0.6 ? "allow" : r < 0.8 ? "block" : "escalate";
      parts.push({ x, lane: Math.floor(Math.random() * LANES), speed: 90 + Math.random() * 70, verdict, state: "in", t: 0 });
    };

    const step = (dt: number) => {
      const gx = gateX();
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.state === "in") {
          p.x += p.speed * dt;
          if (p.x >= gx) {
            p.x = gx;
            p.t = 0;
            p.state = p.verdict === "allow" ? "out" : p.verdict === "block" ? "burst" : "hold";
          }
        } else if (p.state === "hold") {
          p.t += dt;
          if (p.t > 0.9) p.state = "out";
        } else if (p.state === "burst") {
          p.t += dt;
          if (p.t > 0.6) parts.splice(i, 1);
        } else {
          p.x += p.speed * dt * 1.1;
          if (p.x > w + 20) parts.splice(i, 1);
        }
      }
    };

    const draw = () => {
      const gx = gateX();
      c.clearRect(0, 0, w, h);

      c.lineWidth = 1;
      c.strokeStyle = `rgba(${RGB.base},0.10)`;
      for (let i = 0; i < LANES; i++) {
        const y = laneY(i);
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }

      const glow = c.createLinearGradient(gx - 40, 0, gx + 40, 0);
      glow.addColorStop(0, `rgba(${RGB.base},0)`);
      glow.addColorStop(0.5, `rgba(${RGB.base},0.10)`);
      glow.addColorStop(1, `rgba(${RGB.base},0)`);
      c.fillStyle = glow;
      c.fillRect(gx - 40, 0, 80, h);

      const line = c.createLinearGradient(0, 0, 0, h);
      line.addColorStop(0, `rgba(${RGB.base},0)`);
      line.addColorStop(0.5, `rgba(${RGB.base},0.6)`);
      line.addColorStop(1, `rgba(${RGB.base},0)`);
      c.fillStyle = line;
      c.fillRect(gx - 1, 0, 2, h);

      for (const p of parts) {
        const y = laneY(p.lane);
        const before = p.state === "in";
        const rgb = before ? RGB.base : RGB[p.verdict];
        if (p.state === "burst") {
          const k = p.t / 0.6;
          c.strokeStyle = `rgba(${rgb},${(1 - k) * 0.9})`;
          c.lineWidth = 1.5;
          c.beginPath();
          c.arc(p.x, y, 3 + k * 18, 0, Math.PI * 2);
          c.stroke();
          continue;
        }
        c.strokeStyle = `rgba(${rgb},0.35)`;
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(p.x - 26, y);
        c.lineTo(p.x, y);
        c.stroke();
        const r = p.state === "hold" ? 3.2 + Math.sin(p.t * 12) * 0.9 : 2.4;
        c.fillStyle = `rgba(${rgb},0.95)`;
        c.beginPath();
        c.arc(p.x, y, r, 0, Math.PI * 2);
        c.fill();
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce.matches) drawStatic();
    };

    const drawStatic = () => {
      parts.length = 0;
      for (let i = 0; i < 14; i++) spawn(Math.random() * w);
      for (const p of parts) {
        if (p.x > gateX()) p.state = "out";
      }
      draw();
    };

    const loop = (now: number) => {
      raf = 0;
      if (!inView || document.hidden || reduce.matches) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      acc += dt;
      while (acc > 0.6) {
        spawn();
        acc -= 0.6;
      }
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf || reduce.matches || !inView || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) start();
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden) start();
    };
    const onMotion = () => {
      if (reduce.matches) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        drawStatic();
      } else {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    reduce.addEventListener("change", onMotion);

    resize();
    if (reduce.matches) drawStatic();
    else start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      reduce.removeEventListener("change", onMotion);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}