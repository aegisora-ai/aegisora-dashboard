/* Aegisora sound engine. Synthesized with the Web Audio API, no audio files needed. */

export type SoundName =
  | 'approve'
  | 'reject'
  | 'escalate'
  | 'alert'
  | 'block'
  | 'success'
  | 'error'
  | 'notify'
  | 'tick'
  | 'boot';

type Note = {
  at: number; // start offset in seconds
  dur: number; // duration in seconds
  freq: number; // start frequency in Hz
  to?: number; // end frequency in Hz (glide)
  type?: OscillatorType;
  gain?: number; // peak gain 0..1
  lp?: number; // low-pass cutoff in Hz
};

type Prefs = { enabled: boolean; volume: number };

const STORE_KEY = 'aegisora:sound:v1';

let prefs: Prefs = { enabled: true, volume: 0.7 };
let loaded = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const listeners = new Set<() => void>();
const lastPlayed = new Map<SoundName, number>();

function load(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw) as Partial<Prefs>;
    prefs = {
      enabled: typeof p.enabled === 'boolean' ? p.enabled : prefs.enabled,
      volume: typeof p.volume === 'number' ? Math.min(1, Math.max(0, p.volume)) : prefs.volume,
    };
  } catch {
    /* storage unavailable, keep defaults */
  }
}

function save(): void {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable */
  }
}

function emit(): void {
  listeners.forEach((l) => l());
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  let c: AudioContext;
  try {
    c = new Ctor();
  } catch {
    return null;
  }
  const m = c.createGain();
  m.gain.value = prefs.volume;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 6;
  m.connect(comp);
  comp.connect(c.destination);
  ctx = c;
  master = m;
  return c;
}

/* Siren used by "escalate": three two-tone pulses and a rising finish. */
function sirenNotes(): Note[] {
  const notes: Note[] = [];
  for (let i = 0; i < 3; i += 1) {
    const base = i * 0.24;
    notes.push({ at: base, dur: 0.1, freq: 880, type: 'square', gain: 0.13, lp: 2400 });
    notes.push({ at: base + 0.11, dur: 0.1, freq: 1174.66, type: 'square', gain: 0.13, lp: 2400 });
  }
  notes.push({ at: 0.74, dur: 0.34, freq: 1567.98, to: 1760, type: 'triangle', gain: 0.2 });
  return notes;
}

const SOUNDS: Record<SoundName, Note[]> = {
  /* bright rising fifth: access granted */
  approve: [
    { at: 0.0, dur: 0.28, freq: 659.25, type: 'triangle', gain: 0.32 },
    { at: 0.0, dur: 0.2, freq: 1318.5, type: 'sine', gain: 0.1 },
    { at: 0.09, dur: 0.46, freq: 987.77, type: 'triangle', gain: 0.34 },
    { at: 0.09, dur: 0.3, freq: 1975.5, type: 'sine', gain: 0.1 },
  ],
  /* dull falling pair with a low thump: denied */
  reject: [
    { at: 0.0, dur: 0.16, freq: 311.13, to: 293.66, type: 'sawtooth', gain: 0.22, lp: 1100 },
    { at: 0.17, dur: 0.36, freq: 233.08, to: 196, type: 'sawtooth', gain: 0.26, lp: 800 },
    { at: 0.17, dur: 0.32, freq: 116.54, type: 'sine', gain: 0.22 },
  ],
  /* rising two-tone siren: needs a human decision */
  escalate: sirenNotes(),
  /* three sharp beeps: critical */
  alert: [
    { at: 0.0, dur: 0.07, freq: 1480, type: 'square', gain: 0.15, lp: 3200 },
    { at: 0.14, dur: 0.07, freq: 1480, type: 'square', gain: 0.15, lp: 3200 },
    { at: 0.28, dur: 0.12, freq: 1480, type: 'square', gain: 0.15, lp: 3200 },
  ],
  /* heavy double thud: blocked by policy */
  block: [
    { at: 0.0, dur: 0.24, freq: 150, to: 48, type: 'sine', gain: 0.5 },
    { at: 0.0, dur: 0.12, freq: 220, to: 90, type: 'sawtooth', gain: 0.16, lp: 600 },
    { at: 0.15, dur: 0.22, freq: 110, to: 55, type: 'sine', gain: 0.3 },
  ],
  /* quick major arpeggio: done */
  success: [
    { at: 0.0, dur: 0.2, freq: 523.25, type: 'triangle', gain: 0.22 },
    { at: 0.06, dur: 0.2, freq: 659.25, type: 'triangle', gain: 0.22 },
    { at: 0.12, dur: 0.2, freq: 783.99, type: 'triangle', gain: 0.22 },
    { at: 0.18, dur: 0.4, freq: 1046.5, type: 'triangle', gain: 0.26 },
  ],
  /* two low buzzes: something broke */
  error: [
    { at: 0.0, dur: 0.12, freq: 150, type: 'sawtooth', gain: 0.24, lp: 700 },
    { at: 0.16, dur: 0.22, freq: 150, type: 'sawtooth', gain: 0.24, lp: 700 },
  ],
  /* soft ping: new event */
  notify: [
    { at: 0.0, dur: 0.5, freq: 1318.5, type: 'sine', gain: 0.28 },
    { at: 0.0, dur: 0.25, freq: 2637, type: 'sine', gain: 0.07 },
  ],
  /* tiny tick */
  tick: [{ at: 0.0, dur: 0.04, freq: 1800, to: 1200, type: 'sine', gain: 0.12 }],
  /* system online: sweep into a chord */
  boot: [
    { at: 0.0, dur: 0.42, freq: 196, to: 784, type: 'sine', gain: 0.2 },
    { at: 0.38, dur: 0.7, freq: 523.25, type: 'triangle', gain: 0.18 },
    { at: 0.38, dur: 0.7, freq: 783.99, type: 'triangle', gain: 0.16 },
    { at: 0.38, dur: 0.7, freq: 1046.5, type: 'triangle', gain: 0.14 },
  ],
};

function playNote(c: AudioContext, out: AudioNode, t0: number, n: Note): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = n.type ?? 'sine';
  const start = t0 + n.at;
  const end = start + n.dur;
  osc.frequency.setValueAtTime(n.freq, start);
  if (n.to && n.to > 0) osc.frequency.exponentialRampToValueAtTime(n.to, end);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.linearRampToValueAtTime(n.gain ?? 0.3, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  let tail: AudioNode = osc;
  if (n.lp) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = n.lp;
    osc.connect(f);
    tail = f;
  }
  tail.connect(g);
  g.connect(out);
  osc.start(start);
  osc.stop(end + 0.03);
}

/* Call from a user gesture (the component does this on the first pointer / key event). */
export function unlockAudio(): void {
  load();
  const c = audio();
  if (c && c.state === 'suspended') void c.resume().catch(() => undefined);
}

export function playSound(name: SoundName): void {
  load();
  if (!prefs.enabled || typeof window === 'undefined') return;
  const now = Date.now();
  if (now - (lastPlayed.get(name) ?? 0) < 140) return;
  const c = audio();
  const out = master;
  if (!c || !out) return;
  if (c.state !== 'running') {
    /* autoplay still blocked: do not queue stale sounds, wait for a user gesture */
    void c.resume().catch(() => undefined);
    return;
  }
  lastPlayed.set(name, now);
  const t0 = c.currentTime + 0.02;
  for (const note of SOUNDS[name]) playNote(c, out, t0, note);
}

export function isSoundEnabled(): boolean {
  load();
  return prefs.enabled;
}

export function setSoundEnabled(on: boolean): void {
  load();
  prefs = { ...prefs, enabled: on };
  save();
  emit();
}

export function setSoundVolume(v: number): void {
  load();
  prefs = { ...prefs, volume: Math.min(1, Math.max(0, v)) };
  if (master) master.gain.value = prefs.volume;
  save();
  emit();
}

export function subscribeSound(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}