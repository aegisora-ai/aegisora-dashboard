import { PLANS, type Cta as CtaT, type PageData, type Section as SectionT } from "@/components/aegisora/site/content";
import { Btn, Cell, Cells, Cta as CtaBlock, Hero, Sec, SectionHead } from "./ui";
import { AegxPilotForm } from "./pilot-form";

const FALLBACK: CtaT = { label: "Contact", href: "/pilot" };

function gridN(len: number, pref?: number): 2 | 3 | 4 | 6 {
  if (pref === 2 || pref === 3 || pref === 4) return pref;
  if (len === 2) return 2;
  if (len === 4) return 4;
  if (len === 6) return 6;
  return 3;
}

function Filler({ len, n }: { len: number; n: number }) {
  const per = n === 6 ? 3 : n;
  const miss = len % per === 0 ? 0 : per - (len % per);
  return <>{Array.from({ length: miss }).map((_, i) => (<div key={i} className="aegx-cell aegx-cell--fill" aria-hidden="true" />))}</>;
}

function Head({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="aegx-pad aegx-pad--head">
      <SectionHead title={title} intro={intro} />
    </div>
  );
}

function SectionView({ s, locale }: { s: SectionT; locale: string }) {
  switch (s.kind) {
    case "cards": {
      const n = gridN(s.items.length, s.cols);
      return (
        <Sec flush>
          <Head title={s.title} intro={s.intro} />
          <Cells n={n}>
            {s.items.map((it) => (<Cell key={it.title} num={it.tag} title={it.title}>{it.body}</Cell>))}
            <Filler len={s.items.length} n={n} />
          </Cells>
        </Sec>
      );
    }
    case "steps": {
      const n = gridN(s.items.length);
      return (
        <Sec flush>
          <Head title={s.title} intro={s.intro} />
          <Cells n={n}>
            {s.items.map((it, i) => (<Cell key={it.title} num={String(i + 1).padStart(2, "0")} title={it.title}>{it.body}</Cell>))}
            <Filler len={s.items.length} n={n} />
          </Cells>
        </Sec>
      );
    }
    case "table":
      return (
        <Sec flush>
          <Head title={s.title} intro={s.intro} />
          <div className="aegx-sbody">
            <div className="aegx-tablewrap">
              <table className="aegx-table aegx-table--left">
                <thead><tr>{s.columns.map((c) => (<th key={c}>{c}</th>))}</tr></thead>
                <tbody>
                  {s.rows.map((r, i) => (
                    <tr key={i}>{r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Sec>
      );
    case "plans": {
      const top = PLANS.slice(0, 3);
      const rest = PLANS.slice(3);
      const card = (p: (typeof PLANS)[number]) => (
        <div key={p.name} className={"aegx-plan" + (p.highlight ? " aegx-plan--feat" : "")}>
          <h3 className="aegx-h3">{p.name}</h3>
          <p className="aegx-price">{p.price}<span style={{ marginLeft: 8, fontSize: 14, color: "var(--dim)", letterSpacing: 0 }}>{p.period}</span></p>
          <p className="aegx-plan__sub">{p.blurb}</p>
          <ul className="aegx-list">{p.features.map((f) => (<li key={f}>{f}</li>))}</ul>
          <Btn href={p.cta.href} variant={p.highlight ? "solid" : "soft"} block>{p.cta.label}</Btn>
        </div>
      );
      return (
        <Sec flush>
          <Head title={s.title} intro={s.intro} />
          <Cells n={3}>{top.map(card)}</Cells>
          {rest.length ? <Cells n={2}>{rest.map(card)}</Cells> : null}
        </Sec>
      );
    }
    case "faq":
      return (
        <Sec>
          <SectionHead title={s.title} />
          <div className="aegx-faq" style={{ marginTop: 40 }}>
            {s.items.map((it) => (
              <details key={it.title}>
                <summary>{it.title}<span aria-hidden="true">+</span></summary>
                <p>{it.body}</p>
              </details>
            ))}
          </div>
        </Sec>
      );
    case "prose":
      return (
        <Sec>
          <SectionHead title={s.title} />
          <div className="aegx-prose" style={{ marginTop: 32 }}>
            {s.paragraphs.map((p, i) => (<p key={i}>{p}</p>))}
          </div>
        </Sec>
      );
    case "pilotform":
      return (
        <Sec>
          <SectionHead title={s.title} intro={s.intro} />
          <AegxPilotForm locale={locale} />
        </Sec>
      );
    case "cta":
      return <CtaBlock title={s.title} body={s.body} primary={s.ctas[0] ?? FALLBACK} secondary={s.ctas[1]} />;
    default:
      return null;
  }
}

export default function AegxPageView({ page, locale }: { page: PageData; locale: string }) {
  const [a, b] = page.ctas ?? [];
  return (
    <>
      <Hero compact badge={page.eyebrow} title={page.title} intro={page.lead} primary={a} secondary={b} />
      {page.notice ? (
        <Sec flush>
          <div className="aegx-band"><p className="aegx-p">{page.notice}</p></div>
        </Sec>
      ) : null}
      {page.sections.map((s, i) => (<SectionView key={i} s={s} locale={locale} />))}
    </>
  );
}