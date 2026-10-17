"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number };
type Verdict = "allow" | "escalate" | "block";
type Packet = { from: number; verdict: Verdict; t: number; speed: number; hit: boolean };
type Burst = { x: number; y: number; age: number };

const AGENTS = 7;
const TAU = Math.PI * 2;
const RGB = {
  pre: "96,165,250",
  allow: "56,189,248",
  escalate: "240,180,41",
  block: "239,68,68",
  blue: "22,119,255",
  text: "169,187,219",
};

function quad(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

function layout(w: number, h: number) {
  const wide = w > 980;
  const left = wide ? w * 0.42 : w * 0.06;
  const span = w * 0.94 - left;
  const cy = h * 0.5;
  const R = Math.max(26, Math.min(h * 0.14, span * 0.1));
  const gate: Pt = { x: left + span * 0.55, y: cy };
  const agents: Pt[] = [];
  const c1: Pt[] = [];
  const gateIn: Pt[] = [];
  for (let i = 0; i < AGENTS; i++) {
    const k = i / (AGENTS - 1);
    const a: Pt = { x: left + span * 0.05 * Math.sin(k * Math.PI), y: h * (0.15 + 0.7 * k) };
    agents.push(a);
    c1.push({ x: a.x + (gate.x - R - a.x) * 0.62, y: a.y });
    gateIn.push({ x: gate.x - R * 1.05, y: gate.y + (a.y - gate.y) * 0.1 });
  }
  const outs = {
    allow: { x: left + span * 0.97, y: cy - h * 0.2 } as Pt,
    escalate: { x: left + span * 0.97, y: cy + h * 0.2 } as Pt,
  };
  return { gate, R, agents, c1, gateIn, outs };
}
type Scene = ReturnType<typeof layout>;

function pos(p: Packet, s: Scene, t: number): Pt {
  if (t < 1 || p.verdict === "block") {
    const k = Math.max(0, Math.min(1, t));
    return quad(s.agents[p.from], s.c1[p.from], s.gateIn[p.from], k);
  }
  const o = p.verdict === "allow" ? s.outs.allow : s.outs.escalate;
  const a: Pt = { x: s.gate.x + s.R * 1.05, y: s.gate.y };
  const c: Pt = { x: a.x + (o.x - a.x) * 0.55, y: a.y };
  return quad(a, c, o, Math.min(1, t - 1));
}

export function AuthCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas ? canvas.parentElement : null;
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let L: Scene = layout(1, 1);
    let packets: Packet[] = [];
    let bursts: Burst[] = [];
    let flash = 0;
    let flashRgb = RGB.blue;
    const pulse = { allow: 0, escalate: 0 };
    let spawnIn = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let last = performance.now() / 1000;

    const spawn = (seedT?: number) => {
      const r = Math.random();
      const verdict: Verdict = r < 0.7 ? "allow" : r < 0.86 ? "escalate" : "block";
      let t = seedT ?? 0;
      if (verdict === "block" && t >= 1) t = 0.5 + Math.random() * 0.45;
      packets.push({
        from: Math.floor(Math.random() * AGENTS),
        verdict,
        t,
        speed: 0.4 + Math.random() * 0.2,
        hit: t >= 1,
      });
    };

    const update = (dt: number) => {
      spawnIn -= dt;
      if (spawnIn <= 0 && packets.length < 16) {
        spawn();
        spawnIn = 0.35 + Math.random() * 0.5;
      }
      flash = Math.max(0, flash - dt * 2.2);
      pulse.allow = Math.max(0, pulse.allow - dt * 1.8);
      pulse.escalate = Math.max(0, pulse.escalate - dt * 1.8);
      const next: Packet[] = [];
      for (const p of packets) {
        p.t += dt * p.speed;
        if (!p.hit && p.t >= 1) {
          p.hit = true;
          flash = 1;
          flashRgb = RGB[p.verdict];
          if (p.verdict === "block") {
            const q = pos(p, L, 1);
            bursts.push({ x: q.x, y: q.y, age: 0 });
            continue;
          }
        }
        if (p.t >= 2) {
          if (p.verdict === "allow") pulse.allow = 1;
          if (p.verdict === "escalate") pulse.escalate = 1;
          continue;
        }
        next.push(p);
      }
      packets = next;
      bursts = bursts.map((b) => ({ x: b.x, y: b.y, age: b.age + dt })).filter((b) => b.age < 0.9);
      px += (tx - px) * Math.min(1, dt * 3);
      py += (ty - py) * Math.min(1, dt * 3);
    };

    const draw = (time: number) => {
      const s = L;
      const R = s.R;
      ctx.clearRect(0, 0, w, h);

      for (let x = 0; x < w; x += 34) {
        for (let y = 0; y < h; y += 34) {
          const d = Math.hypot(x - s.gate.x, y - s.gate.y);
          const a = 0.04 + 0.12 * Math.exp(-d / (h * 0.5)) + 0.025 * Math.sin(time * 0.9 + x * 0.021 + y * 0.034);
          ctx.fillStyle = "rgba(120,170,255," + Math.max(0, a).toFixed(3) + ")";
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      ctx.save();
      ctx.translate(px, py);

      const glow = ctx.createRadialGradient(s.gate.x, s.gate.y, 0, s.gate.x, s.gate.y, R * 4.5);
      glow.addColorStop(0, "rgba(" + RGB.blue + "," + (0.3 + flash * 0.22).toFixed(3) + ")");
      glow.addColorStop(1, "rgba(" + RGB.blue + ",0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-40, -40, w + 80, h + 80);

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(" + RGB.blue + ",0.22)";
      for (let i = 0; i < AGENTS; i++) {
        ctx.beginPath();
        ctx.moveTo(s.agents[i].x, s.agents[i].y);
        ctx.quadraticCurveTo(s.c1[i].x, s.c1[i].y, s.gateIn[i].x, s.gateIn[i].y);
        ctx.stroke();
      }
      const gx = s.gate.x + R * 1.05;
      for (const o of [s.outs.allow, s.outs.escalate]) {
        ctx.beginPath();
        ctx.moveTo(gx, s.gate.y);
        ctx.quadraticCurveTo(gx + (o.x - gx) * 0.55, s.gate.y, o.x, o.y);
        ctx.stroke();
      }

      for (let i = 0; i < AGENTS; i++) {
        const a = s.agents[i];
        const ph = 0.5 + 0.5 * Math.sin(time * 1.6 + i * 1.3);
        ctx.fillStyle = "rgba(" + RGB.blue + ",0.18)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 7 + ph * 3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(" + RGB.pre + ",0.95)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 3.5, 0, TAU);
        ctx.fill();
      }

      ctx.setLineDash([2, 10]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(" + RGB.pre + ",0.55)";
      ctx.beginPath();
      ctx.arc(s.gate.x, s.gate.y, R, time * 0.3, time * 0.3 + TAU);
      ctx.stroke();
      ctx.setLineDash([18, 14]);
      ctx.strokeStyle = "rgba(" + RGB.blue + ",0.45)";
      ctx.beginPath();
      ctx.arc(s.gate.x, s.gate.y, R * 1.35, -time * 0.18, -time * 0.18 + TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(" + RGB.blue + ",0.14)";
      ctx.beginPath();
      ctx.arc(s.gate.x, s.gate.y, R * 1.75, 0, TAU);
      ctx.stroke();
      if (flash > 0.02) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(" + flashRgb + "," + (flash * 0.85).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(s.gate.x, s.gate.y, R * (1 + (1 - flash) * 0.25), 0, TAU);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(s.gate.x, s.gate.y);
      ctx.rotate(time * 0.12);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU;
        const hx = Math.cos(ang) * R * 0.62;
        const hy = Math.sin(ang) * R * 0.62;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(" + RGB.blue + ",0.10)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(" + RGB.pre + ",0.75)";
      ctx.stroke();
      ctx.restore();

      const k = R * 0.3;
      ctx.save();
      ctx.translate(s.gate.x, s.gate.y);
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(226,238,255,0.9)";
      ctx.beginPath();
      ctx.moveTo(0, -k);
      ctx.lineTo(k * 0.85, -k * 0.55);
      ctx.lineTo(k * 0.85, k * 0.1);
      ctx.quadraticCurveTo(k * 0.85, k * 0.75, 0, k);
      ctx.quadraticCurveTo(-k * 0.85, k * 0.75, -k * 0.85, k * 0.1);
      ctx.lineTo(-k * 0.85, -k * 0.55);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-k * 0.38, 0);
      ctx.lineTo(-k * 0.08, k * 0.3);
      ctx.lineTo(k * 0.42, -k * 0.28);
      ctx.stroke();
      ctx.restore();

      for (const p of packets) {
        const col = p.t < 1 ? RGB.pre : RGB[p.verdict];
        for (let j = 9; j >= 1; j--) {
          const tt = p.t - j * 0.022;
          if (tt < 0) continue;
          const q = pos(p, s, tt);
          ctx.fillStyle = "rgba(" + col + "," + ((1 - j / 10) * 0.5).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2 * (1 - j / 14), 0, TAU);
          ctx.fill();
        }
        const head = pos(p, s, p.t);
        ctx.fillStyle = "rgba(" + col + ",0.22)";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(" + col + ",1)";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 3, 0, TAU);
        ctx.fill();
      }

      for (const b of bursts) {
        const a = (1 - b.age / 0.9) * 0.55;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(" + RGB.block + "," + a.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6 + b.age * 55, 0, TAU);
        ctx.stroke();
      }

      const outList: Array<{ p: Pt; rgb: string; v: number; label: string }> = [
        { p: s.outs.allow, rgb: RGB.allow, v: pulse.allow, label: "ALLOW" },
        { p: s.outs.escalate, rgb: RGB.escalate, v: pulse.escalate, label: "ESCALATE" },
      ];
      ctx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = "center";
      for (const o of outList) {
        ctx.fillStyle = "rgba(" + o.rgb + "," + (0.18 + o.v * 0.4).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(o.p.x, o.p.y, 9 + o.v * 7, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(" + o.rgb + ",0.95)";
        ctx.beginPath();
        ctx.arc(o.p.x, o.p.y, 4.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(" + RGB.text + ",0.6)";
        ctx.fillText(o.label, o.p.x, o.p.y + 24);
      }
      ctx.fillStyle = "rgba(" + RGB.text + ",0.55)";
      ctx.fillText("POLICY ENGINE", s.gate.x, s.gate.y + R * 1.75 + 20);
      ctx.textAlign = "left";
      ctx.fillText("AGENTS", s.agents[0].x - 6, s.agents[0].y - 22);

      ctx.restore();
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L = layout(w, h);
      if (reduce) draw(0);
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * -14;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    };

    const frame = (now: number) => {
      const t = now / 1000;
      const dt = Math.min(0.05, t - last);
      last = t;
      update(dt);
      draw(t);
      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    if (reduce) {
      for (let i = 0; i < 9; i++) spawn(0.15 + Math.random() * 1.7);
      draw(0);
    } else {
      window.addEventListener("pointermove", onMove);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}