"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

type Tier = {
  name: string;
  badge?: string;
  price: [string, string];
  per: [string, string];
  note: [string, string];
  items: string[];
  cta: [string, string];
  href: [string, string];
  feat?: boolean;
};

const EN = {
  title: "Plans and billing",
  intro: "Start free, upgrade to Pro when you need more, or scope a pilot with us.",
  monthly: "Monthly",
  yearly: "Yearly",
  save: "2 months free",
  tiers: [
    {
      name: "Free",
      price: ["$0", "$0"],
      per: ["Free to start", "Free to start"],
      note: ["No card needed to evaluate", "No card needed to evaluate"],
      items: ["Test workspace for your first agent actions", "ALLOW, BLOCK and ESCALATE decisions", "Default BLOCK when no policy matches", "Hash-chained evidence for every decision"],
      cta: ["Start for free", "Start for free"],
      href: ["/signup", "/signup"],
    },
    {
      name: "Pro",
      badge: "Popular",
      price: ["$49", "$490"],
      per: ["per month", "per year"],
      note: ["Billed monthly", "About $41 per month, 2 months free"],
      items: ["Everything in Free", "Up to 5 agents and 5 members", "25,000 decisions per month", "Upgrade any time"],
      cta: ["Get Pro", "Request yearly billing"],
      href: ["/dashboard/billing", "/enterprise"],
      feat: true,
    },
    {
      name: "Enterprise",
      price: ["Scoped", "Scoped"],
      per: ["Agreed in writing before data is connected", "Agreed in writing before data is connected"],
      note: ["Design partner pilot", "Design partner pilot"],
      items: ["Your own policies and agents", "Workflow, environment and term agreed up front", "Direct access to the team", "Production hosting, SSO and audit operations are planned, not yet verified"],
      cta: ["Talk to Enterprise", "Talk to Enterprise"],
      href: ["/enterprise", "/enterprise"],
    },
  ] as Tier[],
};

const DE = {
  title: "Pl\u00e4ne und Abrechnung",
  intro: "Kostenlos starten, bei Bedarf auf Pro wechseln oder gemeinsam einen Pilot abstecken.",
  monthly: "Monatlich",
  yearly: "J\u00e4hrlich",
  save: "2 Monate gratis",
  tiers: [
    {
      name: "Free",
      price: ["$0", "$0"],
      per: ["Kostenlos starten", "Kostenlos starten"],
      note: ["Keine Karte zum Testen n\u00f6tig", "Keine Karte zum Testen n\u00f6tig"],
      items: ["Test-Workspace f\u00fcr deine ersten Agenten-Aktionen", "ALLOW-, BLOCK- und ESCALATE-Entscheidungen", "Standard BLOCK, wenn keine Policy passt", "Hashverkettete Evidence f\u00fcr jede Entscheidung"],
      cta: ["Kostenlos starten", "Kostenlos starten"],
      href: ["/signup", "/signup"],
    },
    {
      name: "Pro",
      badge: "Beliebt",
      price: ["$49", "$490"],
      per: ["pro Monat", "pro Jahr"],
      note: ["Monatliche Abrechnung", "Etwa $41 pro Monat, 2 Monate gratis"],
      items: ["Alles aus Free", "Bis zu 5 Agenten und 5 Mitglieder", "25.000 Entscheidungen pro Monat", "Jederzeit upgraden"],
      cta: ["Pro starten", "J\u00e4hrliche Abrechnung anfragen"],
      href: ["/dashboard/billing", "/enterprise"],
      feat: true,
    },
    {
      name: "Enterprise",
      price: ["Individuell", "Individuell"],
      per: ["Schriftlich vereinbart, bevor Daten angebunden werden", "Schriftlich vereinbart, bevor Daten angebunden werden"],
      note: ["Design-Partner-Pilot", "Design-Partner-Pilot"],
      items: ["Eigene Policies und Agenten", "Workflow, Umgebung und Laufzeit vorab vereinbart", "Direkter Draht zum Team", "Produktions-Hosting, SSO und Audit-Betrieb sind geplant, noch nicht verifiziert"],
      cta: ["Mit Enterprise sprechen", "Mit Enterprise sprechen"],
      href: ["/enterprise", "/enterprise"],
    },
  ] as Tier[],
};

export function PricingTiers({ de }: { de: boolean }) {
  const [yearly, setYearly] = useState(false);
  const c = de ? DE : EN;
  const i = yearly ? 1 : 0;
  return (
    <div className="aegx-tiers" id="plans">
      <div className="aegx-tiers__head">
        <div>
          <h3>{c.title}</h3>
          <p>{c.intro}</p>
        </div>
        <div className="aegx-toggle" role="group" aria-label={c.title}>
          <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>{c.monthly}</button>
          <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>{c.yearly}<em>{c.save}</em></button>
        </div>
      </div>
      <div className="aegx-tiers__grid">
        {c.tiers.map((t) => (
          <div key={t.name} className={"aegx-tier" + (t.feat ? " aegx-tier--feat" : "")}>
            <div className="aegx-tier__top">
              <h4>{t.name}</h4>
              {t.badge ? <span className="aegx-tag">{t.badge}</span> : null}
            </div>
            <p className="aegx-tier__price">{t.price[i]}</p>
            <p className="aegx-tier__per">{t.per[i]}</p>
            <p className="aegx-tier__note">{t.note[i]}</p>
            <ul>{t.items.map((x) => (<li key={x}>{x}</li>))}</ul>
            <Link href={t.href[i]} className={"aegx-btn aegx-btn--block " + (t.feat ? "aegx-btn--solid" : "aegx-btn--soft")}>{t.cta[i]}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}