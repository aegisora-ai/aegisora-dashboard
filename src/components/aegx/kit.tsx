import type { ReactNode } from "react";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Cells, Cta, Feed, Hero, Sec, SectionHead } from "./ui";

// Everything the old kit offers stays available; the four layout pieces below replace its look.
export * from "@/components/aegisora/page-kit";

type Act = { label: string; href: string };

export function PageHero(p: {
  eyebrow?: string; title?: ReactNode; intro?: string; lead?: string; primary?: Act; secondary?: Act;
  rows?: { action: string; meta: string; v: string }[]; children?: ReactNode; [k: string]: unknown;
}) {
  return (
    <Hero
      compact
      badge={p.eyebrow}
      title={typeof p.title === "string" ? p.title : ""}
      intro={p.intro ?? p.lead}
      primary={p.primary}
      secondary={p.secondary}
    >
      {p.rows ? <Feed title="aegisora / runtime" rows={p.rows} /> : null}
      {p.children}
    </Hero>
  );
}

export function Section(p: { eyebrow?: string; title?: string; intro?: string; tone?: string; id?: string; children?: ReactNode; [k: string]: unknown }) {
  return (
    <Sec flush id={p.id}>
      {p.title ? (
        <div className="aegx-pad aegx-pad--head">
          <SectionHead eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        </div>
      ) : null}
      <div className={"aegx-sbody" + (p.title ? "" : " aegx-sbody--top")}>{p.children}</div>
    </Sec>
  );
}

type Item = { icon?: string; title: string; body?: string; href?: string; n?: string; [k: string]: unknown };

export function CardGrid({ cols = 3, items }: { cols?: number; items: Item[] }) {
  const n = (cols === 2 || cols === 4 || cols === 6 ? cols : 3) as 2 | 3 | 4 | 6;
  const perRow = n === 6 ? 3 : n;
  const missing = items.length % perRow === 0 ? 0 : perRow - (items.length % perRow);
  const icons = Lucide as unknown as Record<string, LucideIcon | undefined>;
  return (
    <Cells n={n}>
      {items.map((it, i) => {
        const Icon = it.icon ? icons[it.icon] : undefined;
        const inner = (
          <>
            {Icon ? <span className="aegx-ico"><Icon aria-hidden="true" /></span> : null}
            {it.n ? <span className="aegx-num">{it.n}</span> : null}
            <h3 className="aegx-h3">{it.title}</h3>
            {it.body ? <p className="aegx-p">{it.body}</p> : null}
          </>
        );
        return it.href ? (
          <Link key={i} href={it.href} className="aegx-cell">{inner}</Link>
        ) : (
          <div key={i} className="aegx-cell">{inner}</div>
        );
      })}
      {Array.from({ length: missing }).map((_, i) => (
        <div key={"f" + i} className="aegx-cell aegx-cell--fill" aria-hidden="true" />
      ))}
    </Cells>
  );
}

export function CtaBand(p: { title: string; body?: string; primary: Act; secondary?: Act; [k: string]: unknown }) {
  return <Cta title={p.title} body={p.body ?? ""} primary={p.primary} secondary={p.secondary} />;
}