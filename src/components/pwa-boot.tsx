"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "aegisora-install-dismissed";
const DISMISS_DAYS = 14;
const THEME = "#0a0a0a";

const TEXT = {
  en: {
    title: "Install Aegisora",
    body: "Open the dashboard like an app, straight from your home screen or desktop.",
    install: "Install",
    later: "Not now",
    ios: "Tap Share, then Add to Home Screen.",
  },
  de: {
    title: "Aegisora installieren",
    body: "\u00d6ffne das Dashboard wie eine App, direkt vom Startbildschirm oder Desktop.",
    install: "Installieren",
    later: "Sp\u00e4ter",
    ios: "Tippe auf Teilen und dann auf Zum Home-Bildschirm.",
  },
  tr: {
    title: "Aegisora'y\u0131 y\u00fckle",
    body: "Paneli uygulama gibi, ana ekran\u0131ndan veya masa\u00fcst\u00fcnden a\u00e7.",
    install: "Y\u00fckle",
    later: "\u015eimdi de\u011fil",
    ios: "Payla\u015f d\u00fc\u011fmesine, sonra Ana Ekrana Ekle se\u00e7ene\u011fine dokun.",
  },
} as const;

type Lang = keyof typeof TEXT;

function ensureMeta(name: string, content: string) {
  if (document.head.querySelector(`meta[name="${name}"]`)) return;
  const m = document.createElement("meta");
  m.name = name;
  m.content = content;
  document.head.appendChild(m);
}

function dismissedRecently(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export default function PwaBoot() {
  const [mode, setMode] = useState<"prompt" | "ios" | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    ensureMeta("theme-color", THEME);
    ensureMeta("mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-capable", "yes");
    ensureMeta("apple-mobile-web-app-title", "Aegisora");

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }

    if (isStandalone() || dismissedRecently()) return;

    const l = document.documentElement.lang.slice(0, 2).toLowerCase();
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setLang(l === "de" || l === "tr" ? l : "en"), 0));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => {
      setMode(null);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (isIos()) timers.push(window.setTimeout(() => setMode("ios"), 2500));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mode) return null;
  const t = TEXT[lang];

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage unavailable */
    }
    setMode(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
    setMode(null);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        margin: "0 auto",
        maxWidth: 440,
        zIndex: 2147483000,
        background: "#111827",
        color: "#f9fafb",
        border: "1px solid #374151",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: "#d1d5db", marginBottom: 12 }}>
        {mode === "ios" ? t.ios : t.body}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={dismiss}
          style={{ background: "transparent", color: "#d1d5db", border: "1px solid #4b5563", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}
        >
          {t.later}
        </button>
        {mode === "prompt" && (
          <button
            type="button"
            onClick={install}
            style={{ background: "#f9fafb", color: "#111827", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            {t.install}
          </button>
        )}
      </div>
    </div>
  );
}