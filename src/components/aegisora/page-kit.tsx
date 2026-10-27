"use client";

import { useMemo, type ReactNode } from "react"; import { useTranslations } from "next-intl";
import "@/styles/zp.css"; import "@/components/aegisora/bw/aeg-chrome.css";
import { TypedLine } from "@/components/aegisora/typed-line";
import { VerdictBadge } from "@/components/zp/ui";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight, BookOpen, Clock, Eye, FileText, Fingerprint, Gauge, GitBranch,
  KeyRound, Layers, Lock, Scale, ScrollText, ShieldCheck, Terminal, UserCheck,
  Users, Webhook, Workflow, Zap,
} from "lucide-react";

const ICONS = {
  BookOpen, Clock, Eye, FileText, Fingerprint, Gauge, GitBranch, KeyRound, Layers,
  Lock, Scale, ScrollText, ShieldCheck, Terminal, UserCheck, Users, Webhook, Workflow, Zap,
};

export type IconName = keyof typeof ICONS;
export type Cta = { label: string; href: string };
export type Row = { action: string; meta: string; v: "ALLOW" | "ESCALATE" | "BLOCK" };
export type CardItem = { icon?: IconName; n?: string; title: string; body: string; href?: string };



export function PageHero({
  eyebrow, title, phrases, intro, lead, primary, secondary, rows, children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  lead?: string;
  phrases?: string[];
  primary?: Cta;
  secondary?: Cta;
  rows?: Row[];
  children?: ReactNode;
}) {
  const text = intro ?? lead; const t = useTranslations("Kit"); const defaultPhrases = useMemo(() => [t("p1"), t("p2"), t("p3"), t("p4")], [t]);
  return (
    <section className="zp zpk-hero">
      <div className={"zpk-wrap zpk-hero-in" + (rows ? " zpk-hero-in--split" : "")}>
        <div className="zpk-hero-text">
          <p className="zp-eyebrow">{eyebrow}</p>
          <h1 className="zpk-h1">{title}</h1>
          <p className="zpk-typed">
            <TypedLine decorative phrases={phrases?.length ? phrases : defaultPhrases} />
          </p>
          {text ? <p className="zpk-lead">{text}</p> : null}
          {primary || secondary ? (
            <div className="zpk-actions">
              {primary ? (
                <Link href={primary.href} className="zp-btn zp-btn--primary">
                  {primary.label}
                </Link>
              ) : null}
              {secondary ? (
                <Link href={secondary.href} className="zp-btn zp-btn--outline">
                  {secondary.label}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
        {rows ? (
          <div className="zpk-art">
            <div className="zp-mock">
              <div className="zp-mock-bar">
                <b>{t("runtimeDecisions")}</b>
                <span className="zp-tag">{t("live")}</span>
              </div>
              {rows.map((r) => (
                <div key={r.action} className="zp-mock-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="zp-mock-act">{r.action}</div>
                    <div className="zp-mock-sub">{r.meta}</div>
                  </div>
                  <VerdictBadge v={r.v} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Section({
  eyebrow, title, intro, lead, tone = "base", children,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  lead?: string;
  tone?: "base" | "alt" | "tinted";
  children: ReactNode;
}) {
  const text = intro ?? lead;
  const hasHeader = Boolean(eyebrow || title || text);
  return (
    <section className={"zp zpk-section" + (tone === "base" ? "" : " zpk-section--alt")}>
      <div className="zpk-wrap">
        {hasHeader ? (
          <div className="zpk-head">
            {eyebrow ? <p className="zp-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="zpk-h2">{title}</h2> : null}
            {text ? <p className="zpk-sub">{text}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function CardGrid({ items, cols = 3 }: { items: CardItem[]; cols?: 2 | 3 | 4 }) { const t = useTranslations("Kit");
  return (
    <div className={"zpk-grid zpk-grid--" + cols}>
      {items.map((it) => {
        const Icon = it.icon ? ICONS[it.icon] : null;
        const inner = (
          <>
            {it.n ? <span className="zpk-n">{it.n}</span> : null}
            {Icon ? (
              <span className="zpk-icon">
                <Icon size={20} aria-hidden />
              </span>
            ) : null}
            <h3>{it.title}</h3>
            <p>{it.body}</p>
            {it.href ? (
              <span className="zpk-more">
                {t("learnMore")} <ArrowRight size={14} aria-hidden />
              </span>
            ) : null}
          </>
        );
        return it.href ? (
          <Link key={it.title} href={it.href} className="zpk-card">
            {inner}
          </Link>
        ) : (
          <div key={it.title} className="zpk-card">
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function CtaBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: Cta;
  secondary?: Cta;
  [extra: string]: unknown;
}) {
  return (
    <section className="zp aegx-cta">
      <div className="aegx-cta__in">
        <h2 className="aegx-cta__title">{title}</h2>
        <p className="aegx-cta__body">{body}</p>
        <div className="aegx-cta__actions">
          <Link href={primary.href} className="zp-btn zp-btn--primary">
            {primary.label}
          </Link>
          {secondary ? (
            <Link href={secondary.href} className="zp-btn zp-btn--outline">
              {secondary.label}
              <ArrowRight size={16} aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
export function Eyebrow({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <p className={"zpk-eb" + (accent ? " zpk-eb--accent" : "")}>{children}</p>;
}

export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <figure>
      <pre className="zpk-code">
        <code>{code}</code>
      </pre>
      {caption ? <figcaption className="zpk-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="zpk-tablewrap">
      <table className="zpk-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? "zpk-td-first" : undefined}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Steps({ items, cols = 3 }: { items: [string, string][]; cols?: 2 | 3 | 4 }) {
  return (
    <CardGrid
      cols={cols}
      items={items.map(([title, body], i) => ({ n: String(i + 1).padStart(2, "0"), title, body }))}
    />
  );
}