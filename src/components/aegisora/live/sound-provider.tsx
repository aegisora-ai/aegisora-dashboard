"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { play, setSoundEnabled, soundEnabled, type SoundKind } from "@/lib/aegisora/sound";

const TARGET = 'button, a[href], [role="button"], [role="switch"], [role="tab"], [role="menuitem"], input[type="checkbox"], input[type="radio"], summary';
const DANGER = /delete|remove|revoke|block|disable|cancel|reject|deny|sil\b|kald/i;
const CONFIRM = /save|create|add|approve|confirm|send|invite|connect|import|apply|generate|export/i;

function pick(el: HTMLElement): SoundKind | null {
  const mode = el.getAttribute("data-sound");
  if (mode === "off") return null;
  if (mode === "confirm" || mode === "danger" || mode === "nav" || mode === "click") return mode;
  if (el.matches('[role="switch"], input[type="checkbox"]')) {
    const on = el.getAttribute("aria-checked") === "true" || (el as HTMLInputElement).checked;
    return on ? "off" : "on";
  }
  const label = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 60);
  if (DANGER.test(label)) return "danger";
  if (el.matches("a[href]")) return "nav";
  if ((el as HTMLButtonElement).type === "submit" || CONFIRM.test(label)) return "confirm";
  return "click";
}

export function SoundProvider() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const el = t.closest<HTMLElement>(TARGET);
      if (!el) return;
      if ((el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true") return;
      const kind = pick(el);
      if (kind) play(kind);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setOn(soundEnabled()), 0);
    return () => window.clearTimeout(id);
  }, []);
  const Icon = on ? Volume2 : VolumeX;
  return (
    <button
      type="button"
      data-sound="off"
      aria-label={on ? "Mute interface sounds" : "Unmute interface sounds"}
      aria-pressed={!on}
      title={on ? "Sounds on" : "Sounds off"}
      onClick={() => { const next = !on; setSoundEnabled(next); setOn(next); if (next) play("on"); }}
      className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-3 hover:text-foreground"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}