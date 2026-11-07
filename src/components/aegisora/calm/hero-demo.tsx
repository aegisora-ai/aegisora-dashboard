"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { CHIP_ORDER, SAMPLES } from "../bw/bw-data";
import type { Sample } from "../bw/bw-data";

const TYPED = [
  "payments.transfer, finance-agent, $48,000",
  "db.drop_table on users",
  "crm.read_ticket 4821",
  "vendors.export_bank_details",
];

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

export function HeroDemo() {
  const t = useTranslations("HomeCalm.demo");
  const tr = useTranslations("HomeUi.hero");
  const reasons: Record<string, string> = {
    transfer: tr("reasons.transfer"),
    "drop-table": tr("reasons.dropTable"),
    "read-ticket": tr("reasons.readTicket"),
    "bank-export": tr("reasons.bankExport"),
    "files-export": tr("reasons.filesExport"),
    default: tr("reasons.fallback"),
  };

  const chips = CHIP_ORDER.map((id) => SAMPLES.find((s) => s.id === id)).filter((s): s is Sample => Boolean(s));
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Sample | null>(chips[1] ?? chips[0] ?? null);
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!typing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % TYPED.length), 2600);
    return () => window.clearInterval(id);
  }, [typing]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) { setTyping(false); return; }
    setResult(evaluate(value).sample ?? FALLBACK);
  }

  function pick(s: Sample) {
    setTyping(false);
    setValue(s.action);
    setResult(s);
  }

  return (
    <div className="vc-glass vc-demo">
      <form onSubmit={onSubmit} className="vc-demo__field">
        <label htmlFor="vc-demo-input" className="sr-only">{t("label")}</label>
        <input
          id="vc-demo-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={TYPED[idx]}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="vc-btn vc-btn--primary vc-btn--sm">
          {t("run")} <ArrowRight aria-hidden="true" size={16} />
        </button>
      </form>

      <div className="vc-chips" role="group" aria-label={t("label")}>
        {chips.map((s) => (
          <button key={s.id} type="button" className="vc-chip" onClick={() => pick(s)}>{s.action}</button>
        ))}
      </div>

      {result ? (
        <div className="vc-result" key={result.id + result.action} aria-live="polite">
          <div className="vc-result__head">
            <span className={"vc-pill vc-pill--" + result.verdict}><i aria-hidden="true" />{result.verdict}</span>
            <code className="vc-result__action">{result.action}</code>
          </div>
          <p className="vc-result__reason">{reasons[result.id] ?? result.reason}</p>
          <dl className="vc-result__meta">
            <div><dt>{t("agent")}</dt><dd>{result.agent}</dd></div>
            <div><dt>{t("policy")}</dt><dd>{result.policy ?? t("noPolicy")}</dd></div>
            <div><dt>{t("evidence")}</dt><dd className="vc-mono">{result.evidence}</dd></div>
          </dl>
        </div>
      ) : null}
      <p className="vc-demo__note">{t("disclaimer")}</p>
    </div>
  );
}