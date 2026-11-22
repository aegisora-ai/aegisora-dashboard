"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const NAMES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  tr: "Türkçe",
};

export function BwLocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (routing.locales.length < 2) return null;

  return (
    <div className="bwls" ref={rootRef}>
      <button
        type="button"
        className="bwls__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={"bwls__chev" + (open ? " is-open" : "")}>
          <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="bwls__menu" role="listbox" aria-label={t("language")}>
          {routing.locales.map((l) => (
            <li key={l} role="none">
              <button
                type="button"
                role="option"
                lang={l}
                aria-selected={l === current}
                className={"bwls__item" + (l === current ? " is-on" : "")}
                onClick={() => {
                  setOpen(false);
                  if (l !== current) router.replace(pathname, { locale: l });
                }}
              >
                <span>{NAMES[l] ?? l.toUpperCase()}</span>
                <span className="bwls__code">{l.toUpperCase()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .bwls{position:relative;display:inline-block}
        .bwls__btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid rgba(127,127,127,.4);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:13px;font-weight:600;letter-spacing:.04em;cursor:pointer;transition:border-color .15s}
        .bwls__btn:hover{border-color:rgba(127,127,127,.8)}
        .bwls__btn:focus-visible,.bwls__item:focus-visible{outline:2px solid currentColor;outline-offset:2px}
        .bwls__chev{transition:transform .15s}
        .bwls__chev.is-open{transform:rotate(180deg)}
        .bwls__menu{position:absolute;right:0;top:calc(100% + 6px);z-index:1000;min-width:150px;margin:0;padding:4px;list-style:none;border:1px solid rgba(127,127,127,.4);border-radius:10px;background:Canvas;color:CanvasText;box-shadow:0 10px 30px rgba(0,0,0,.25)}
        .bwls__item{display:flex;width:100%;align-items:center;justify-content:space-between;gap:16px;padding:9px 10px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:14px;text-align:left;cursor:pointer}
        .bwls__item:hover{background:rgba(127,127,127,.15)}
        .bwls__item.is-on{font-weight:700}
        .bwls__code{font-size:11px;opacity:.55;letter-spacing:.06em}
      `}</style>
    </div>
  );
}
