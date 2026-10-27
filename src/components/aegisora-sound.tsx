'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import {
  isSoundEnabled,
  playSound,
  setSoundEnabled,
  subscribeSound,
  unlockAudio,
  type SoundName,
} from '../lib/aegisora-sound';

/* Route prefix of the dashboard. Empty means "detect the dashboard shell from the DOM". */
const DASH_PREFIX: string = '/[locale]';

const ALL_SOUNDS: readonly SoundName[] = [
  'approve',
  'reject',
  'escalate',
  'alert',
  'block',
  'success',
  'error',
  'notify',
  'tick',
  'boot',
];

/* Priority when several events land in the same moment. */
const PRIORITY: readonly SoundName[] = ['escalate', 'block', 'reject', 'approve'];

/* Status words found in newly rendered rows / badges. */
const ROW_RULES: ReadonlyArray<readonly [RegExp, SoundName]> = [
  [/\bescalat(?:e|ed|es|ing|ion)\b/, 'escalate'],
  [/\bblock(?:ed)?\b/, 'block'],
  [/\b(?:reject(?:ed)?|den(?:y|ied)|declined)\b/, 'reject'],
  [/\b(?:approved?|allow(?:ed)?|granted)\b/, 'approve'],
];

/* Labels of buttons the person clicks. */
const CLICK_RULES: ReadonlyArray<readonly [RegExp, SoundName]> = [
  [/^\W*escalate\b/, 'escalate'],
  [/^\W*block\b/, 'block'],
  [/^\W*(?:reject|deny|decline|revoke)\b/, 'reject'],
  [/^\W*(?:approve|accept|allow|grant)\b/, 'approve'],
];

const QUIET_MS = 1500; /* ignore DOM changes right after mount or navigation (initial data load) */
const INPUT_QUIET_MS = 900; /* ignore DOM changes caused by the person's own click / typing */

/* Text of an element without buttons / links / icons. Text nodes are joined with spaces,
   because table cells would otherwise run together ("payments.sendESCALATE"). */
function gatherText(node: Node, out: string[]): void {
  if (node.nodeType === 3) {
    const t = (node.textContent ?? '').trim();
    if (t) out.push(t);
    return;
  }
  node.childNodes.forEach((c) => gatherText(c, out));
}

function visibleText(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll('button, [role="button"], a, svg, script, style, option').forEach((n) => n.remove());
  const parts: string[] = [];
  gatherText(clone, parts);
  return parts.join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function classifyRow(text: string): SoundName | null {
  for (const [rx, sound] of ROW_RULES) {
    if (rx.test(text)) return sound;
  }
  return null;
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <path d="m16 9 5 6" />
          <path d="m21 9-5 6" />
        </>
      )}
    </svg>
  );
}

export function AegisoraSound() {
  const pathname = usePathname() ?? '';
  const [active, setActive] = useState(false);
  const enabled = useSyncExternalStore(subscribeSound, isSoundEnabled, () => false);
  const lastInput = useRef(0);
  const quietUntil = useRef(Infinity); // real value is set in the effect below

  /* active only inside the dashboard shell */
  useEffect(() => {
    quietUntil.current = Date.now() + QUIET_MS;
    const check = () => {
      const hasShell = document.querySelector('[data-app-main]') !== null;
      const byPrefix =
        DASH_PREFIX !== '' && (pathname === DASH_PREFIX || pathname.startsWith(DASH_PREFIX + '/'));
      setActive(hasShell || byPrefix);
    };
    check();
    const t1 = window.setTimeout(check, 600);
    const t2 = window.setTimeout(check, 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  useEffect(() => {
    if (!active) return;

    /* 1) audio unlock + remember the last user input */
    const onInput = () => {
      lastInput.current = Date.now();
      unlockAudio();
    };
    window.addEventListener('pointerdown', onInput, { capture: true, passive: true });
    window.addEventListener('touchstart', onInput, { capture: true, passive: true });
    window.addEventListener('keydown', onInput, { capture: true });

    /* 2) clicks on action buttons */
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target ? target.closest<HTMLElement>('[data-sound], button, [role="button"], a') : null;
      if (!el) return;
      const explicit = el.getAttribute('data-sound');
      if (explicit) {
        if ((ALL_SOUNDS as readonly string[]).includes(explicit)) playSound(explicit as SoundName);
        return;
      }
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return;
      const label = ((el.getAttribute('aria-label') ?? '') + ' ' + (el.textContent ?? ''))
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      if (label.length === 0 || label.length > 40) return;
      for (const [rx, sound] of CLICK_RULES) {
        if (rx.test(label)) {
          playSound(sound);
          return;
        }
      }
    };
    document.addEventListener('click', onClick, true);

    /* 3) new live rows and status changes inside the dashboard content */
    const root =
      document.querySelector<HTMLElement>('[data-app-main]') ??
      document.querySelector<HTMLElement>('main') ??
      document.body;
    const recent = new Map<string, number>();
    const pending = new Set<SoundName>();
    let count = 0;
    let timer: number | null = null;

    const flush = () => {
      timer = null;
      const total = count;
      const kinds = new Set(pending);
      pending.clear();
      count = 0;
      if (total === 0 || total > 4) return; /* bulk render (filter / tab switch): stay silent */
      for (const k of PRIORITY) {
        if (kinds.has(k)) {
          playSound(k);
          return;
        }
      }
    };

    const collect = (el: Element | null) => {
      if (!el) return;
      const now = Date.now();
      if (now < quietUntil.current) return;
      if (now - lastInput.current < INPUT_QUIET_MS) return;
      const raw = el.textContent ?? '';
      if (raw.length < 3 || raw.length > 400) return;
      const text = visibleText(el);
      const kind = classifyRow(text);
      if (!kind) return;
      const key = kind + '|' + text.slice(0, 120);
      const seen = recent.get(key);
      if (seen && now - seen < 6000) return;
      if (recent.size > 200) recent.clear();
      recent.set(key, now);
      pending.add(kind);
      count += 1;
      if (timer === null) timer = window.setTimeout(flush, 250);
    };

    const rowObserver = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'childList') {
          r.addedNodes.forEach((n) => {
            if (n.nodeType === 1) collect(n as Element);
          });
        } else if (r.type === 'characterData') {
          collect(r.target.parentElement);
        }
      }
    });
    rowObserver.observe(root, { childList: true, subtree: true, characterData: true });

    /* 4) toasts (Sonner exposes data-type) */
    const toastObserver = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const el = n as Element;
          if (!el.closest('[data-sonner-toaster]')) return;
          const toast = el.matches('[data-sonner-toast]') ? el : el.querySelector('[data-sonner-toast]');
          if (!toast) return;
          const type = toast.getAttribute('data-type');
          if (type === 'success') playSound('success');
          else if (type === 'error') playSound('error');
          else if (type === 'warning') playSound('alert');
          else if (type === 'info') playSound('notify');
        });
      }
    });
    toastObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('pointerdown', onInput, true);
      window.removeEventListener('touchstart', onInput, true);
      window.removeEventListener('keydown', onInput, true);
      document.removeEventListener('click', onClick, true);
      rowObserver.disconnect();
      toastObserver.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [active, pathname]);

  useEffect(() => {
    if (!active) return;
    let done = false;
    try { done = !!sessionStorage.getItem('aeg:session-played'); } catch {}
    if (done) return;
    const t = window.setTimeout(() => {
      try { sessionStorage.setItem('aeg:session-played', '1'); } catch {}
      playSound('session');
    }, 900);
    return () => window.clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return (
    <button
      type="button"
      className="aeg-sound-toggle"
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute system sounds' : 'Enable system sounds'}
      title={enabled ? 'System sounds: on' : 'System sounds: off'}
      onClick={() => {
        const next = !enabled;
        setSoundEnabled(next);
        if (next) {
          unlockAudio();
          window.setTimeout(() => {
            let first = false;
            try {
              first = !sessionStorage.getItem('aeg:brand-played');
              if (first) sessionStorage.setItem('aeg:brand-played', '1');
            } catch {}
            playSound(first ? 'brand' : 'boot');
          }, 80);
        }
      }}
    >
      <SpeakerIcon on={enabled} />
    </button>
  );
}