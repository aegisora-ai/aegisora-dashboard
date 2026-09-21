import Link from "next/link";
import { btnOutline, btnPrimary } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <p className={cn("font-mono text-xs tracking-[0.25em]", accent ? "text-cyan" : "text-muted-foreground")}>
      {children}
    </p>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="aeg-hero aeg-grid-bg border-b border-border">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pb-20 md:pt-24">
        <Eyebrow accent>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-4xl leading-[1.05] md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lead}</p>
        {children}
      </div>
    </section>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  lead,
  tone = "plain",
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  tone?: "plain" | "tinted";
  children?: React.ReactNode;
}) {
  const hasHead = Boolean(eyebrow || title || lead);
  return (
    <section id={id} className={cn("scroll-mt-20", tone === "tinted" && "border-y border-border bg-surface-1")}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {title && <h2 className="mt-4 max-w-3xl text-3xl tracking-tight md:text-4xl">{title}</h2>}
        {lead && <p className="mt-4 max-w-2xl text-muted-foreground">{lead}</p>}
        {children && <div className={hasHead ? "mt-10" : ""}>{children}</div>}
      </div>
    </section>
  );
}

export function DataTable({ head, rows, mono = [] }: { head: string[]; rows: string[][]; mono?: number[] }) {
  return (
    <div className="aeg-panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {r.map((c, j) => (
                <td key={j} className={cn("px-4 py-3", mono.includes(j) ? "font-mono text-xs" : "text-muted-foreground")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KV({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-border/60">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[130px_1fr] items-center gap-3 py-2.5 text-sm">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="break-all font-mono text-xs">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const colMap = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" } as const;

export function Steps({ items, cols = 3 }: { items: string[][]; cols?: 2 | 3 | 4 | 5 }) {
  return (
    <ol className={cn("aeg-panel grid gap-px overflow-hidden bg-border", colMap[cols])}>
      {items.map(([title, body], i) => (
        <li key={title} className="bg-surface-2 p-5">
          <div className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
          <div className="mt-2 text-sm font-medium">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </li>
      ))}
    </ol>
  );
}

export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  return (
    <figure>
      <pre className="aeg-panel overflow-x-auto p-4 font-mono text-xs leading-6">
        <code>{code}</code>
      </pre>
      {caption && <figcaption className="mt-2 font-mono text-[11px] text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

export function CtaBand({ title }: { title: string }) {
  return (
    <section className="border-t border-border bg-surface-1">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl tracking-tight md:text-4xl">{title}</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={btnPrimary}>Test Aegisora</Link>
          <Link href="/enterprise" className={btnOutline}>Talk to Enterprise</Link>
        </div>
      </div>
    </section>
  );
}