import "./page-bw.css";
import PilotForm from "./PilotForm";
import { PLANS, type Cta, type PageData, type Section } from "./content";
import { bwFontVars } from "../bw/bw-font-vars";
import { BwBtn, BwSection } from "../bw/bw-ui";

function Buttons({ ctas }: { ctas: Cta[] }) {
  return (
    <div className="pv-actions">
      {ctas.map((c) => (
        <BwBtn key={c.label} href={c.href} tone={c.variant === "ghost" ? "light" : "blue"} size="md">
          {c.label}
        </BwBtn>
      ))}
    </div>
  );
}

function Head({ title, intro, id }: { title: string; intro?: string; id?: string }) {
  return (
    <header className="pv-head">
      <h2 id={id} className="bw-h2">{title}</h2>
      {intro ? <p className="bw-lead">{intro}</p> : null}
    </header>
  );
}

function SectionView({ s, locale }: { s: Section; locale: string }) {
  switch (s.kind) {
    case "cards":
      return (
        <>
          <Head title={s.title} intro={s.intro} />
          <div className="pv-grid">
            {s.items.map((it) => (
              <div key={it.title} className="pv-card">
                {it.tag ? <span className="pv-tag">{it.tag}</span> : null}
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
          <ol className="pv-grid pv-steps">
            {s.items.map((it, i) => (
              <li key={it.title} className="pv-card">
                <span className="pv-n">{i + 1}</span>
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
          <div className="pv-tablewrap">
            <table className="pv-table">
              <thead>
                <tr>{s.columns.map((c) => (<th key={c}>{c}</th>))}</tr>
              </thead>
              <tbody>
                {s.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, j) => (
                      <td key={j} className={j === 0 ? "pv-first" : undefined}>{cell}</td>
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
          <div className="pv-grid pv-plans">
            {PLANS.map((p) => (
              <div key={p.name} className={"pv-card pv-plan" + (p.highlight ? " pv-plan--hi" : "")}>
                <h3>{p.name}</h3>
                <div className="pv-price">{p.price} <span>{p.period}</span></div>
                <p>{p.blurb}</p>
                <ul className="pv-list">
                  {p.features.map((f) => (<li key={f}>{f}</li>))}
                </ul>
                <Buttons ctas={[p.cta]} />
              </div>
            ))}
          </div>
        </>
      );
    case "faq":
      return (
        <>
          <Head title={s.title} />
          <div className="pv-faq">
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
          <div className="pv-prose">
            {s.paragraphs.map((p, i) => (<p key={i}>{p}</p>))}
          </div>
        </>
      );
    case "pilotform":
      return (
        <>
          <Head id="apply" title={s.title} intro={s.intro} />
          <div className="pv-formcard">
            <PilotForm locale={locale} />
          </div>
        </>
      );
    case "cta":
      return (
        <div className="pv-ctabox">
          <h2 className="bw-h2">{s.title}</h2>
          <p className="bw-lead">{s.body}</p>
          <Buttons ctas={s.ctas} />
        </div>
      );
    default:
      return null;
  }
}

export default function PageView({ page, locale }: { page: PageData; locale: string }) {
  return (
    <div className={"bw-root bw-page pv-page " + bwFontVars}>
      <BwSection>
        <div className="bw-pad pv-hero">
          <p className="bw-eyebrow">{page.eyebrow}</p>
          <h1 className="pv-h1">{page.title}</h1>
          <p className="bw-lead pv-herolead">{page.lead}</p>
          {page.ctas ? <Buttons ctas={page.ctas} /> : null}
          {page.notice ? <p className="pv-notice">{page.notice}</p> : null}
        </div>
      </BwSection>
      {page.sections.map((s, i) => (
        <BwSection key={i} className={i % 2 === 0 ? "bw-sec--soft" : undefined}>
          <div className="bw-pad pv-sec">
            <SectionView s={s} locale={locale} />
          </div>
        </BwSection>
      ))}
    </div>
  );
}
