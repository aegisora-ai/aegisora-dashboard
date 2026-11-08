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
    <div className="aegx-ss">
      <div className="aegx-ss__box">
        <Search aria-hidden="true" />
        <input
          ref={ref}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={onKeyDown}
          placeholder={t("searchPh")}
          aria-label={t("searchAria")}
        />
        <kbd>Ctrl K</kbd>
      </div>
      {q.trim().length >= 2 ? (
        <div className="aegx-ss__pop">
          {results.length === 0 ? (
            <p className="aegx-ss__none">{t("noResults")}</p>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.href}>
                  <a href={r.href} onMouseEnter={() => setActive(i)} className={i === active ? "is-on" : ""}>
                    <FileText aria-hidden="true" />
                    <span>
                      <b>{r.title}</b>
                      <small>{r.collection} · {r.summary}</small>
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