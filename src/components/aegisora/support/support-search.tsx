"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Search } from "lucide-react";

type Item = { title: string; summary: string; collection: string; href: string };

export function SupportSearch({ items }: { items: Item[] }) {
  const t = useTranslations("HelpCenter");
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return items
      .filter((i) => (i.title + " " + i.summary + " " + i.collection).toLowerCase().includes(term))
      .sort((a, b) => Number(!a.title.toLowerCase().includes(term)) - Number(!b.title.toLowerCase().includes(term)))
      .slice(0, 6);
  }, [q, items]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      window.location.assign(results[active].href);
    } else if (e.key === "Escape") {
      setQ("");
    }
  };

  return (
    <div className="relative max-w-xl">
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-border bg-surface-1 px-4 shadow-sm focus-within:ring-2 focus-within:ring-primary/40">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={ref}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={t("searchPh")}
          aria-label={t("searchAria")}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline">Ctrl K</kbd>
      </div>
      {q.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">{t("noResults")}</p>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.href} className="border-b border-border last:border-b-0">
                  <a
                    href={r.href}
                    onMouseEnter={() => setActive(i)}
                    className={"flex items-start gap-3 px-5 py-3 transition " + (i === active ? "bg-surface-3" : "")}
                  >
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold">{r.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{r.collection} · {r.summary}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}