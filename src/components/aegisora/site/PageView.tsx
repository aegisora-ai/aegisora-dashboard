import Link from "next/link";
import "@/styles/zp.css";
import PilotForm from "./PilotForm";
import { PLANS, type Cta, type PageData, type Section } from "./content";

function to(locale: string, href: string): string {
  return href.startsWith("/") ? "/" + locale + href : href;
}

function Buttons({ ctas, locale }: { ctas: Cta[]; locale: string }) {
  return (
    <div className="zpk-actions">
      {ctas.map((c) => (
        <Link
          key={c.label}
          href={to(locale, c.href)}
          className={"zp-btn " + (c.variant === "ghost" ? "zp-btn--outline" : "zp-btn--primary")}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

function Head({ title, intro, id }: { title: string; intro?: string; id?: string }) {
  return (
    <div className="zpk-head">
      <h2 id={id} className="zpk-h2">{title}</h2>
      {intro ? <p className="zpk-sub">{intro}</p> : null}
    </div>
  );
}

function SectionView({ s, locale }: { s: Section; locale: string }) {
  switch (s.kind) {
    case "cards":
      return (
        <>
          <Head title={s.title} intro={s.intro} />
          <div className={"zpk-grid zpk-grid--" + (s.cols ?? 3)}>
            {s.items.map((it) => (
              <div key={it.title} className="zpk-card">
                {it.tag ? <span className="zpk-tag">{it.tag}</span> : null}
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </>
      );
    case "steps":
      return (
        <>
          <Head title={s.title} intro={s.intro} />
          <ol className="zpk-grid zpk-grid--2 zpk-steps">
            {s.items.map((it, i) => (
              <li key={it.title} className="zpk-card">
                <span className="zpk-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </li>
            ))}
          </ol>
        </>
      );
    case "table":
      return (
        <>
          <Head title={s.title} intro={s.intro} />
          <div className="zpk-tablewrap">
            <table className="zpk-table">
              <thead>
                <tr>
                  {s.columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, j) => (
                      <td key={j} className={j === 0 ? "zpk-td-first" : undefined}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    case "plans":
      return (
        <>
          <Head title={s.title} intro={s.intro} />
          <div className="zpk-plans">
            {PLANS.map((p) => (
              <div key={p.name} className={"zpk-card zpk-plan" + (p.highlight ? " zpk-plan--hi" : "")}>
                <h3>{p.name}</h3>
                <div className="zpk-price">
                  {p.price} <span>{p.period}</span>
                </div>
                <p>{p.blurb}</p>
                <ul className="zpk-features">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Buttons ctas={[p.cta]} locale={locale} />
              </div>
            ))}
          </div>
        </>
      );
    case "faq":
      return (
        <>
          <Head title={s.title} />
          <div className="zpk-faq">
            {s.items.map((it) => (
              <details key={it.title}>
                <summary>{it.title}</summary>
                <p>{it.body}</p>
              </details>
            ))}
          </div>
        </>
      );
    case "prose":
      return (
        <>
          <Head title={s.title} />
          <div className="zpk-prose">
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </>
      );
    case "pilotform":
      return (
        <>
          <Head id="apply" title={s.title} intro={s.intro} />
          <div className="dark zpk-darkpanel">
            <PilotForm locale={locale} />
          </div>
        </>
      );
    case "cta":
      return (
        <div className="zpk-ctabox">
          <h2 className="zpk-h2">{s.title}</h2>
          <p className="zpk-sub">{s.body}</p>
          <Buttons ctas={s.ctas} locale={locale} />
        </div>
      );
    default:
      return null;
  }
}

export default function PageView({ page, locale }: { page: PageData; locale: string }) {
  return (
    <div className="zp zpk-page">
      <section className="zpk-hero">
        <div className="zpk-wrap">
          <div className="zpk-hero-text">
            <p className="zp-eyebrow">{page.eyebrow}</p>
            <h1 className="zpk-h1">{page.title}</h1>
            <p className="zpk-lead">{page.lead}</p>
            {page.ctas ? <Buttons ctas={page.ctas} locale={locale} /> : null}
            {page.notice ? <p className="zpk-notice">{page.notice}</p> : null}
          </div>
        </div>
      </section>
      {page.sections.map((s, i) => (
        <section key={i} className={"zpk-section" + (i % 2 === 1 ? " zpk-section--alt" : "")}>
          <div className="zpk-wrap">
            <SectionView s={s} locale={locale} />
          </div>
        </section>
      ))}
    </div>
  );
}