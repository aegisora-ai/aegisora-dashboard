"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Lock, Plus, ShieldCheck } from "lucide-react";
import { CHIP_ORDER, SAMPLES } from "./bw-data";
import type { Sample } from "./bw-data";
import { Ball, Pill } from "./bw-ui";
import { Link } from "@/i18n/navigation";

const TYPED = [
  "payments.transfer, finance-agent, $48,000",
  "db.drop_table on users",
  "crm.read_ticket 4821",
  "vendors.export_bank_details",
];

/* Extra German search words, so a German visitor also finds a match. */
const EXTRA_KEYS: Record<string, string[]> = {
  transfer: ["ueberweisung", "\u00fcberweisung", "zahlung"],
  "drop-table": ["tabelle l\u00f6schen", "tabelle loeschen"],
  "read-ticket": ["ticket lesen"],
  "bank-export": ["bankdaten", "lieferant"],
  "files-export": ["dateien", "datei exportieren"],
};

function evaluate(text: string): { sample: Sample | null; known: boolean } {
  const q = text.toLowerCase();
  if (!q.trim()) return { sample: null, known: false };
  for (const s of SAMPLES) {
    const keys = s.keys.concat(EXTRA_KEYS[s.id] ?? []);
    if (keys.some((k) => q.indexOf(k.toLowerCase()) !== -1)) return { sample: s, known: true };
  }
  return { sample: null, known: false };
}

const FALLBACK: Sample = {
  id: "default",
  action: "your.action",
  agent: "your-agent",
  context: "No policy in this illustrative set covers it",
  policy: null,
  verdict: "BLOCK",
  reason: "No matching policy. The default is BLOCK.",
  evidence: "7f20ab...19ce",
  keys: [],
  chip: "other",
};

export function BwHero() {
  const t = useTranslations("HomeUi.hero");
  const ph = t("placeholder");
  const reasons: Record<string, string> = {
    transfer: t("reasons.transfer"),
    "drop-table": t("reasons.dropTable"),
    "read-ticket": t("reasons.readTicket"),
    "bank-export": t("reasons.bankExport"),
    "files-export": t("reasons.filesExport"),
    default: t("reasons.fallback"),
  };

  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState(ph);
  const [typing, setTyping] = useState(true);
  const [result, setResult] = useState<Sample | null>(null);
  const [asked, setAsked] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!typing) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let line = 0;
    let ch = 0;
    let dir = 1;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = TYPED[line];
      ch += dir;
      setPlaceholder(full.slice(0, ch) + (ch < full.length || dir === -1 ? "|" : ""));
      let wait = dir === 1 ? 55 : 22;
      if (dir === 1 && ch >= full.length) {
        dir = -1;
        wait = 1700;
      } else if (dir === -1 && ch <= 0) {
        dir = 1;
        line = (line + 1) % TYPED.length;
        wait = 450;
      }
      timer = setTimeout(tick, wait);
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [typing]);

  function run(text: string) {
    const found = evaluate(text);
    setAsked(text.trim());
    setResult(found.sample ?? FALLBACK);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) {
      setTyping(false);
      setPlaceholder(ph);
      inputRef.current?.focus();
      return;
    }
    run(value);
  }

  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    if (result) setResult(null);
  }

  function pick(s: Sample) {
    setTyping(false);
    setValue(s.action);
    run(s.action);
  }

  const chips = CHIP_ORDER.map((id) => SAMPLES.find((s) => s.id === id)).filter((s): s is Sample => Boolean(s));

  return (
    <section className="bw-hero" aria-labelledby="bw-hero-title">
      <div className="bw-wrap bw-hero__inner">
        <div aria-hidden="true" className="bw-hero__frame" />
        <span aria-hidden="true" className="bw-screw bw-screw--l" />
        <span aria-hidden="true" className="bw-screw bw-screw--r" />
        <div aria-hidden="true" className="bw-blocks bw-blocks--l" />
        <div aria-hidden="true" className="bw-blocks bw-blocks--r" />

        <Ball tone="blue" className="bw-float bw-hero__ball-l">
          <ShieldCheck />
        </Ball>
        <Ball tone="green" className="bw-float bw-float--b bw-hero__ball-r">
          <Lock />
        </Ball>

        <div aria-hidden="true" className="bw-note">
          <span className="bw-note__shadow" />
          <p>{t("note")}</p>
        </div>

        <div aria-hidden="true" className="bw-toast bw-float">
          <span className="bw-toast__av">
            <ShieldCheck />
          </span>
          <span>
            <b>dec_0042</b>
            <em>crm.read_ticket</em>
          </span>
          <span className="bw-pill bw-pill--allow bw-pill--xs">ALLOW</span>
        </div>

        <div className="bw-hero__copy">
          <span className="bw-badge">
            {t("badge")}
            <b>{t("badgeTag")}</b>
          </span>
          <h1 id="bw-hero-title" className="bw-hero__title">
            {t("titleA")}
            <br />
            {t("titleB")}
          </h1>
          <p className="bw-hero__sub">{t("sub")}</p>

          <form className="bw-chat" onSubmit={onSubmit} aria-label={t("formAria")}>
            <label htmlFor="bw-chat-input" className="bw-sr">
              {t("inputLabel")}
            </label>
            <textarea
              id="bw-chat-input"
              ref={inputRef}
              className="bw-chat__input"
              rows={2}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onFocus={() => setTyping(false)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            {result ? (
              <div className="bw-chat__result" aria-live="polite">
                <div className="bw-chat__row">
                  <code>{result.id === "default" ? asked.slice(0, 48) || result.action : result.action}</code>
                  <Pill verdict={result.verdict} />
                </div>
                <p>{reasons[result.id] ?? reasons.default}</p>
                <small>{t("resultMeta", { policy: result.policy ?? t("none"), evidence: result.evidence })}</small>
                <Link href="/demo" className="bw-chat__live">{t("live")}</Link>
              </div>
            ) : null}
            <div className="bw-chat__bar">
              <button type="button" className="bw-chat__plus" aria-label={t("pickAria")} onClick={() => pick(SAMPLES[0])}>
                <Plus aria-hidden="true" />
              </button>
              <button type="submit" className="bw-chat__go" aria-label={t("goAria")}>
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </form>

          <div className="bw-chips" aria-label={t("chipsAria")}>
            <div className="bw-chips__track">
              {chips.map((s) => (
                <button key={s.id} type="button" className="bw-chip" onClick={() => pick(s)}>
                  <Plus aria-hidden="true" />
                  {s.chip}
                </button>
              ))}
            </div>
          </div>

          <p className="bw-hero__fine">{t("fine")}</p>
        </div>
      </div>
    </section>
  );
}