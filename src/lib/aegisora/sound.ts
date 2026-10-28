export type SoundKind = "click" | "nav" | "confirm" | "danger" | "on" | "off";

const KEY = "aeg-sound";
const MASTER = 0.5;
let ctx: AudioContext | null = null;
let last = 0;

export function soundEnabled(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}

export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* storage unavailable */ }
}

function tone(c: AudioContext, freq: number, start: number, dur: number, vol: number, endFreq?: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol * MASTER, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function play(kind: SoundKind) {
  if (typeof window === "undefined" || !soundEnabled()) return;
  const now = performance.now();
  if (now - last < 45) return;
  last = now;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    switch (kind) {
      case "click": tone(ctx, 720, t, 0.07, 0.18, 560); break;
      case "nav": tone(ctx, 520, t, 0.09, 0.16, 780); break;
      case "confirm": tone(ctx, 660, t, 0.1, 0.2); tone(ctx, 990, t + 0.07, 0.16, 0.2); break;
      case "danger": tone(ctx, 300, t, 0.16, 0.2, 200, "triangle"); break;
      case "on": tone(ctx, 600, t, 0.07, 0.18); tone(ctx, 900, t + 0.05, 0.09, 0.18); break;
      case "off": tone(ctx, 900, t, 0.07, 0.18); tone(ctx, 600, t + 0.05, 0.09, 0.18); break;
    }
  } catch { /* audio blocked: stay silent */ }
}