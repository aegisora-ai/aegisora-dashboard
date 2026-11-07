import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Variant = "solid" | "soft";
type Action = { label: string; href: string };

export function Btn({ href, variant = "solid", small, block, children }: { href: string; variant?: Variant; small?: boolean; block?: boolean; children: ReactNode }) {
  const cls = ["aegx-btn", "aegx-btn--" + variant, small ? "aegx-btn--sm" : "", block ? "aegx-btn--block" : ""].filter(Boolean).join(" ");
  return <Link href={href} className={cls}>{children}</Link>;
}

export function Hero({ badge, title, dim, intro, primary, secondary, compact, children }: {
  badge?: string; title: string; dim?: string; intro?: string; primary?: Action; secondary?: Action; compact?: boolean; children?: ReactNode;
}) {
  return (
    <section className={"aegx-sec aegx-hero" + (compact ? " aegx-hero--compact" : "")}>
      <div className="aegx-hero__art" aria-hidden="true"><i className="aegx-hero__band" /></div>
      <div className="aegx-col">
        <div className="aegx-hero__in">
          {badge ? <span className="aegx-eyebrow">{badge}</span> : null}
          <h1 className="aegx-h1">
            {title}
            {dim ? (<><br /><span className="aegx-dim">{dim}</span></>) : null}
          </h1>
          {intro ? <p className="aegx-lead">{intro}</p> : null}
          {primary || secondary ? (
            <div className="aegx-actions">
              {primary ? <Btn href={primary.href}>{primary.label}</Btn> : null}
              {secondary ? <Btn href={secondary.href} variant="soft">{secondary.label}</Btn> : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}

export function Feed({ title, rows }: { title: string; rows: { action: string; meta: string; v: string }[] }) {
  return (
    <div className="aegx-feed" role="group" aria-label={title}>
      <div className="aegx-feed__bar">
        <span className="aegx-feed__dots" aria-hidden="true"><i /><i /><i /></span>
        <span>{title}</span>
      </div>
      {rows.map((r) => (
        <div key={r.action} className="aegx-feed__row">
          <div>
            <p className="aegx-mono">{r.action}</p>
            <p className="aegx-feed__meta">{r.meta}</p>
          </div>
          <span className={"aegx-v aegx-v--" + r.v.toLowerCase()}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

export function SectionHead({ eyebrow, title, dim, intro }: { eyebrow?: string; title: string; dim?: string; intro?: string }) {
  return (
    <div className="aegx-sh">
      {eyebrow ? <span className="aegx-eyebrow">{eyebrow}</span> : null}
      <h2 className="aegx-h2">
        {title}
        {dim ? (<> <span className="aegx-dim">{dim}</span></>) : null}
      </h2>
      {intro ? <p className="aegx-lead">{intro}</p> : null}
    </div>
  );
}

export function Sec({ children, flush, id }: { children: ReactNode; flush?: boolean; id?: string }) {
  return (
    <section id={id} className="aegx-sec">
      <div className="aegx-col">
        <div className={flush ? undefined : "aegx-pad"}>{children}</div>
      </div>
    </section>
  );
}

export function Cells({ n, children }: { n: 2 | 3 | 4 | 6; children: ReactNode }) {
  return <div className={"aegx-cells aegx-cells--" + n}>{children}</div>;
}

export function Cell({ icon: Icon, num, title, children }: { icon?: LucideIcon; num?: string; title: string; children?: ReactNode }) {
  return (
    <div className="aegx-cell">
      {Icon ? <span className="aegx-ico"><Icon aria-hidden="true" /></span> : null}
      {num ? <span className="aegx-num">{num}</span> : null}
      <h3 className="aegx-h3">{title}</h3>
      {children ? <p className="aegx-p">{children}</p> : null}
    </div>
  );
}

export function Cta({ title, body, primary, secondary }: { title: string; body: string; primary: Action; secondary?: Action }) {
  return (
    <section className="aegx-sec">
      <div className="aegx-col">
        <div className="aegx-cta">
          <div className="aegx-cta__art" aria-hidden="true" />
          <div className="aegx-cta__in">
            <h2 className="aegx-h2">{title}</h2>
            <p className="aegx-lead">{body}</p>
            <div className="aegx-actions aegx-actions--left">
              <Btn href={primary.href}>{primary.label}</Btn>
              {secondary ? <Btn href={secondary.href} variant="soft">{secondary.label}</Btn> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}