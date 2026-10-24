import Link from "next/link";
import styles from "./site.module.css";
import PilotForm from "./PilotForm";
import { PLANS, type Cta, type PageData, type Section } from "./content";

function to(locale: string, href: string): string {
  return href.startsWith("/") ? "/" + locale + href : href;
}

function Buttons({ ctas, locale }: { ctas: Cta[]; locale: string }) {
  return (
    <div className={styles.ctaRow}>
      {ctas.map((c) => (
        <Link
          key={c.label}
          href={to(locale, c.href)}
          className={c.variant === "ghost" ? styles.btnGhost : styles.btnPrimary}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

function SectionView({ s, locale }: { s: Section; locale: string }) {
  switch (s.kind) {
    case "cards": {
      const colClass = s.cols === 2 ? styles.grid2 : s.cols === 4 ? styles.grid4 : styles.grid3;
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <div className={colClass}>
            {s.items.map((it) => (
              <div key={it.title} className={styles.card}>
                {it.tag ? <span className={styles.tag}>{it.tag}</span> : null}
                <h3 className={styles.h3}>{it.title}</h3>
                <p className={styles.body}>{it.body}</p>
              </div>
            ))}
          </div>
        </>
      );
    }
    case "steps":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <ol className={styles.steps}>
            {s.items.map((it, i) => (
              <li key={it.title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div>
                  <h3 className={styles.h3}>{it.title}</h3>
                  <p className={styles.body}>{it.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      );
    case "table":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
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
                      <td key={j}>{cell}</td>
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
          <h2 className={styles.h2}>{s.title}</h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <div className={styles.plans}>
            {PLANS.map((p) => (
              <div key={p.name} className={p.highlight ? styles.planHi : styles.plan}>
                <h3 className={styles.h3}>{p.name}</h3>
                <p className={styles.price}>
                  {p.price} <span className={styles.period}>{p.period}</span>
                </p>
                <p className={styles.body}>{p.blurb}</p>
                <ul className={styles.features}>
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
          <h2 className={styles.h2}>{s.title}</h2>
          <div className={styles.faq}>
            {s.items.map((it) => (
              <details key={it.title} className={styles.details}>
                <summary>{it.title}</summary>
                <p className={styles.body}>{it.body}</p>
              </details>
            ))}
          </div>
        </>
      );
    case "prose":
      return (
        <>
          <h2 className={styles.h2}>{s.title}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className={styles.proseP}>
              {p}
            </p>
          ))}
        </>
      );
    case "pilotform":
      return (
        <>
          <h2 id="apply" className={styles.h2}>
            {s.title}
          </h2>
          {s.intro ? <p className={styles.intro}>{s.intro}</p> : null}
          <PilotForm locale={locale} />
        </>
      );
    case "cta":
      return (
        <div className={styles.ctaBox}>
          <h2 className={styles.h2}>{s.title}</h2>
          <p className={styles.intro}>{s.body}</p>
          <Buttons ctas={s.ctas} locale={locale} />
        </div>
      );
    default:
      return null;
  }
}

export default function PageView({ page, locale }: { page: PageData; locale: string }) {
  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1 className={styles.h1}>{page.title}</h1>
          <p className={styles.lead}>{page.lead}</p>
          {page.ctas ? <Buttons ctas={page.ctas} locale={locale} /> : null}
          {page.notice ? <p className={styles.notice}>{page.notice}</p> : null}
        </div>
      </div>
      {page.sections.map((s, i) => (
        <div key={i} className={styles.section}>
          <div className={styles.wrap}>
            <SectionView s={s} locale={locale} />
          </div>
        </div>
      ))}
    </div>
  );
}