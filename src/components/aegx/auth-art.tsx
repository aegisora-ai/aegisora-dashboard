"use client";

import { useEffect, useRef } from "react";

const BLOBS = [
  { c: "20,72,216", r: 0.62, sx: 0.00021, sy: 0.00017, px: 0.0, py: 1.3, cx: 0.2, cy: 0.78, a: 0.8 },
  { c: "31,122,255", r: 0.7, sx: 0.00017, sy: 0.00023, px: 2.1, py: 0.4, cx: 0.55, cy: 0.9, a: 0.85 },
  { c: "77,163,255", r: 0.5, sx: 0.00025, sy: 0.00015, px: 4.0, py: 2.2, cx: 0.8, cy: 0.7, a: 0.6 },
  { c: "10,42,143", r: 0.8, sx: 0.00019, sy: 0.00027, px: 1.1, py: 3.3, cx: 0.4, cy: 0.35, a: 0.7 },
];

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function AuthArt() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = (t: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of BLOBS) {
        const x = w * (b.cx + 0.14 * Math.sin(t * b.sx + b.px));
        const y = h * (b.cy + 0.1 * Math.sin(t * b.sy + b.py));
        const r = Math.max(w, h) * b.r;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(" + b.c + "," + b.a + ")");
        g.addColorStop(1, "rgba(" + b.c + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 3; i++) {
        const sw = Math.min(w * 0.56, 300) - i * 24;
        const sh = sw * 0.62;
        const cx = w * (0.5 + (i - 1) * 0.07) + Math.sin(t * 0.0006 + i) * 14;
        const cy = h * 0.4 + i * sh * 0.34 + Math.sin(t * 0.0009 + i * 1.7) * 12;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.2 + i * 0.07);
        const g = ctx.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2);
        g.addColorStop(0, "rgba(190,220,255," + (0.26 - i * 0.05) + ")");
        g.addColorStop(1, "rgba(31,122,255," + (0.07 - i * 0.01) + ")");
        rr(ctx, -sw / 2, -sh / 2, sw, sh, 22);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(200,225,255," + (0.5 - i * 0.1) + ")";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-sw / 2 + 22, -sh / 2 + 1);
        ctx.lineTo(sw / 2 - 22, -sh / 2 + 1);
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = "rgba(160,200,255,0.5)";
      for (let i = 0; i < 40; i++) {
        const px = ((i * 97) % 100) / 100;
        const py = ((i * 61 + 13) % 100) / 100;
        ctx.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.001 + i));
        ctx.fillRect(px * w, py * h, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    };
    const loop = (t: number) => { draw(t); raf = requestAnimationFrame(loop); };
    if (reduce) draw(2000); else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" />;
}