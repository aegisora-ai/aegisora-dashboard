"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { TypedLine } from "@/components/aegisora/typed-line";
import { HeroCanvas } from "@/components/aegisora/hero-canvas";
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

const BG =
  "radial-gradient(ellipse 42% 55% at 6% 12%, #1599ff 0%, rgba(21,153,255,0) 70%), radial-gradient(ellipse 45% 55% at 92% 85%, #0f9bff 0%, rgba(15,155,255,0) 70%), radial-gradient(ellipse 60% 50% at 50% 40%, #001f7d 0%, rgba(0,31,125,0) 80%), #001a6e";

const VERDICT: Record<Row["v"], string> = {
  ALLOW: "bg-emerald-100 text-emerald-700",
  ESCALATE: "bg-amber-100 text-amber-700",
  BLOCK: "bg-red-100 text-red-700",
};

const CARD = "rounded-2xl border border-white/10 bg-white/[0.04]";
const DEFAULT_PHRASES = ["Decide before it runs.", "Evidence you can verify.", "Fail closed by default.", "Built for security teams."];
const EYEBROW = "text-xs font-medium uppercase tracking-[0.16em] text-sky-300";

function fadeUp(i = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
  };
}

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
  const text = intro ?? lead;
  return (
    <section className="relative isolate overflow-hidden text-white" style={{ background: BG }}>
      <HeroCanvas className="pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 -z-10 size-72 animate-pulse rounded-full bg-sky-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-80 animate-pulse rounded-full bg-blue-500/25 blur-3xl" />
      <div
        className={
          "mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-24 " +
          (rows ? "grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]" : "")
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className={rows ? "" : "max-w-3xl"}
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 text-lg font-medium text-[#9fd0ff] sm:text-xl"><TypedLine decorative phrases={phrases?.length ? phrases : DEFAULT_PHRASES} /></p>
          {text ? <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{text}</p> : null}
          {primary || secondary ? (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primary ? (
                <Link
                  href={primary.href}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-7 text-sm font-semibold text-[#0a2a7a] transition hover:bg-white/90"
                >
                  {primary.label}
                </Link>
              ) : null}
              {secondary ? (
                <Link
                  href={secondary.href}
                  className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-white/60 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {secondary.label}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
          {children}
        </motion.div>

        {rows ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" as const }}
            className="overflow-hidden rounded-2xl bg-white text-left text-slate-900 shadow-2xl shadow-black/30"
          >
            <div className="flex h-12 items-center justify-between border-b border-slate-200 px-5">
              <span className="text-xs font-medium text-slate-500">Runtime decisions</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>
            <ul className="divide-y divide-slate-200">
              {rows.map((r) => (
                <li key={r.action} className="flex h-16 items-center justify-between gap-3 px-5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">{r.action}</p>
                    <p className="truncate text-xs text-slate-500">{r.meta}</p>
                  </div>
                  <span className={"shrink-0 rounded px-2 py-1 font-mono text-[11px] font-semibold " + VERDICT[r.v]}>{r.v}</span>
                </li>
              ))}
            </ul>
          </motion.div>
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
    <section className={tone === "base" ? "" : "border-y border-white/10 bg-[#031249]"}>
      <div className={"mx-auto max-w-[1280px] px-4 sm:px-6 " + (hasHeader ? "py-16 lg:py-24" : "py-12 lg:py-16")}>
        {hasHeader ? (
          <motion.div {...fadeUp()} className="max-w-3xl">
            {eyebrow ? <p className={EYEBROW}>{eyebrow}</p> : null}
            {title ? <h2 className="mt-4 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">{title}</h2> : null}
            {text ? <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">{text}</p> : null}
          </motion.div>
        ) : null}
        <div className={hasHeader ? "mt-10" : ""}>{children}</div>
      </div>
    </section>
  );
}

export function CardGrid({ items, cols = 3 }: { items: CardItem[]; cols?: 2 | 3 | 4 }) {
  const grid =
    cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={"grid gap-4 " + grid}>
      {items.map((it, i) => {
        const Icon = it.icon ? ICONS[it.icon] : null;
        const inner = (
          <>
            {it.n ? <span className={EYEBROW + " font-mono"}>{it.n}</span> : null}
            {Icon ? (
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
                <Icon className="size-5" />
              </span>
            ) : null}
            <h3 className={"text-lg font-medium " + (it.n || Icon ? "mt-4" : "")}>{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{it.body}</p>
            {it.href ? (
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300">
                Learn more
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            ) : null}
          </>
        );
        return (
          <motion.div key={it.title} {...fadeUp(i)}>
            {it.href ? (
              <Link
                href={it.href}
                className={CARD + " group block h-full p-6 transition hover:-translate-y-0.5 hover:border-sky-400/50 hover:bg-white/[0.07]"}
              >
                {inner}
              </Link>
            ) : (
              <div className={CARD + " h-full p-6"}>{inner}</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function CtaBand({
  title, body, primary, secondary,
}: {
  title: string;
  body: string;
  primary: Cta;
  secondary?: Cta;
}) {
  return (
    <section
      className="border-t border-white/10"
      style={{
        background:
          "radial-gradient(ellipse 45% 70% at 90% 100%, rgba(15,155,255,0.45) 0%, rgba(2,11,46,0) 70%), radial-gradient(ellipse 40% 60% at 5% 0%, rgba(21,153,255,0.35) 0%, rgba(2,11,46,0) 70%), #001a6e",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-24">
        <motion.div {...fadeUp()} className="max-w-3xl">
          <h2 className="text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">{body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primary.href}
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-7 text-sm font-semibold text-[#0a2a7a] transition hover:bg-white/90"
            >
              {primary.label}
            </Link>
            {secondary ? (
              <Link
                href={secondary.href}
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-white/60 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {secondary.label}
                <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Geriye uyumlu bilesenler (docs, legal sayfalar) ---------- */

export function Eyebrow({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <p className={"text-xs font-medium uppercase tracking-[0.16em] " + (accent ? "text-sky-300" : "text-white/60")}>
      {children}
    </p>
  );
}

export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <figure>
      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#030f3d] p-5 font-mono text-sm leading-relaxed text-sky-100">
        <code>{code}</code>
      </pre>
      {caption ? <figcaption className="mt-2 text-xs text-white/55">{caption}</figcaption> : null}
    </figure>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-white/[0.06] text-white">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-white/75">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={"px-4 py-3 " + (j === 0 ? "font-medium text-white" : "")}>{c}</td>
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