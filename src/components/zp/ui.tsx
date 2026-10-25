"use client";

import "@/styles/zp.css";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import { Minus, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type Verdict = "ALLOW" | "BLOCK" | "ESCALATE";

export function Reveal({ children, className }: { children: ReactNode; i?: number; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function Eyebrow({ children, plain = false }: { children: ReactNode; plain?: boolean }) {
  return <p className={"zp-eyebrow" + (plain ? " zp-eyebrow--plain" : "")}>{children}</p>;
}

export function Btn({
  href,
  kind = "primary",
  small = false,
  children,
}: {
  href: string;
  kind?: "primary" | "dark" | "outline";
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`zp-btn zp-btn--${kind}${small ? " zp-btn--sm" : ""}`}>
      {children}
    </Link>
  );
}

export function VerdictBadge({ v }: { v: Verdict }) {
  return <span className={`zp-verdict zp-verdict--${v}`}>{v}</span>;
}

export function Accordion({ items }: { items: { title: string; body: string }[] }) {
  const uid = useId();
  const [open, setOpen] = useState(0);
  return (
    <div className="zp-acc">
      <p className="zp-acc-label">Features</p>
      {items.map((it, i) => {
        const on = open === i;
        const pid = `${uid}-p${i}`;
        return (
          <div key={it.title} className="zp-acc-item" data-open={on}>
            <button
              type="button"
              className="zp-acc-btn"
              aria-expanded={on}
              aria-controls={pid}
              onClick={() => setOpen(on ? -1 : i)}
            >
              <span>{it.title}</span>
              {on ? <Minus size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
            </button>
            <div className="zp-acc-panel" id={pid} aria-hidden={!on}>
              <div>
                <p>{it.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MockWindow({ title, tag, children }: { title: string; tag?: string; children: ReactNode }) {
  return (
    <div className="zp-mock">
      <div className="zp-mock-bar">
        <b>{title}</b>
        {tag ? <span className="zp-tag">{tag}</span> : null}
      </div>
      {children}
    </div>
  );
}
