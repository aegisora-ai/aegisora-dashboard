import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Contact,
  CreditCard,
  Crown,
  Database,
  Flame,
  FolderOpen,
  Globe,
  Landmark,
  Layers,
  ListChecks,
  Lock,
  Mail,
  Minus,
  Quote,
  RotateCw,
  Shield,
  ShieldCheck,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ACTIONS, COMPARE, COMPARE_COLS, SAMPLES, SCENARIOS } from "./bw-data";
import type { Mark } from "./bw-data";
import { bwFontVars } from "./bw-font-vars";
import { BwHero } from "./bw-hero";
import { BwEffects, FaqList, HowTabs, PlatformTabs, RevealText } from "./bw-client";
import { Ball, BwBtn, BwHatch, BwHead, BwIcon, BwMark, BwSection, Marquee, Pill, Stat } from "./bw-ui";
import {
  ApprovalVisual,
  EvidenceVisual,
  HookVisual,
  PhoneVerdict,
  PolicyVisual,
  ProblemChart,
  RoutingVisual,
  ScopeVisual,
  SolutionChart,
  TrendVisual,
  GrowthChart,
} from "./bw-visuals";

const CODE_LINES: [string, string][] = [
  ["k", "const"],
  ["", " decision = "],
  ["k", "await"],
  ["f", " checkAction"],
  ["", "({ agent, action, context });"],
];

function MarkCell({ v }: { v: Mark }) {
  const t = useTranslations("HomeBody.compare");
  if (v === "yes") {
    return (
      <span className="bw-yes">
        <Check aria-hidden="true" />
        <span className="bw-sr">{t("yes")}</span>
      </span>
    );
  }
  if (v === "partial") {
    return (
      <span className="bw-part">
        <Minus aria-hidden="true" />
        <span className="bw-sr">{t("partly")}</span>
      </span>
    );
  }
  return (
    <span className="bw-no">
      <X aria-hidden="true" />
      <span className="bw-sr">{t("no")}</span>
    </span>
  );
}

const TILES: { icon: typeof Mail; cat: string; action: string }[] = [
  { icon: CreditCard, cat: "payments", action: "payments.transfer" },
  { icon: Database, cat: "databases", action: "db.drop_table" },
  { icon: Mail, cat: "email", action: "email.send" },
  { icon: Contact, cat: "crm", action: "crm.read_ticket" },
  { icon: FolderOpen, cat: "files", action: "files.export" },
  { icon: Terminal, cat: "code", action: "code.execute" },
  { icon: Globe, cat: "browser", action: "browser.navigate" },
  { icon: Landmark, cat: "vendors", action: "vendors.export_bank_details" },
];

const DOCS = [
  { id: "quickstart", href: "/docs/quickstart" },
  { id: "technical", href: "/docs/technical" },
  { id: "pilots", href: "/pilot" },
];

export function BwHome() {
  const t = useTranslations("HomeBody");
  const transfer = SAMPLES.find((s) => s.id === "transfer") ?? SAMPLES[0];
  const read = SAMPLES.find((s) => s.id === "read-ticket") ?? SAMPLES[0];
  const drop = SAMPLES.find((s) => s.id === "drop-table") ?? SAMPLES[0];

  const two = (k: string) => (
    <>
      {t(k + ".titleA")}
      <br />
      {t(k + ".titleB")}
    </>
  );

  const features = [
    { id: "policy", icon: Layers, vis: <PolicyVisual /> },
    { id: "approval", icon: ShieldCheck, vis: <ApprovalVisual /> },
    { id: "evidence", icon: ListChecks, vis: <EvidenceVisual /> },
  ];
  const decisions = [
    { id: "allow", s: read, icon: Check },
    { id: "escalate", s: transfer, icon: ShieldCheck },
    { id: "block", s: drop, icon: Lock },
  ];
  const benefits = [
    { id: "insight", icon: Layers, vis: <TrendVisual /> },
    { id: "security", icon: Shield, vis: <RoutingVisual /> },
    { id: "scope", icon: Lock, vis: <ScopeVisual /> },
    { id: "delivery", icon: Zap, vis: <HookVisual /> },
  ];
  const plans = [
    { id: "test", icon: Zap, href: "/signup", tone: "dark" as const, badge: false },
    { id: "pilot", icon: Crown, href: "/pilot", tone: "blue" as const, badge: true },
    { id: "prod", icon: Flame, href: "/enterprise", tone: "dark" as const, badge: false },
  ];

  return (
    <div className={"bw-root bw-page " + bwFontVars}>
      <BwEffects />
      <BwHero />

      {/* action strip */}
      <section aria-label={t("strip.aria")} className="bw-sec bw-strip">
        <div className="bw-strip__in">
          <Marquee
            items={ACTIONS}
            label={t("strip.label", { list: ACTIONS.join(", ") })}
            render={(a, i) => (
              <span key={a + i} className="bw-strip__item">
                <BwMark size={18} />
                {a}
              </span>
            )}
          />
        </div>
      </section>

      {/* features */}
      <BwSection id="features">
        <div className="bw-pad">
          <BwHead align="split" eyebrow={t("features.eyebrow")} title={two("features")} intro={t("features.intro")} />
        </div>
        <div className="bw-cols3">
          {features.map((f) => {
            const Ico = f.icon;
            return (
              <article key={f.id} className="bw-feat bw-rv">
                {f.vis}
                <div className="bw-feat__txt">
                  <p className="bw-tagline">
                    <Ico aria-hidden="true" />
                    {t("features." + f.id + ".tag")}
                  </p>
                  <h3>{t("features." + f.id + ".title")}</h3>
                  <p>{t("features." + f.id + ".body")}</p>
                </div>
              </article>
            );
          })}
        </div>
      </BwSection>
      <BwHatch />

      {/* showcase */}
      <section className="bw-sec bw-sec--tight">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-show">
            <span className="bw-show__label">
              <svg width="38" height="18" viewBox="0 0 38 18" aria-hidden="true">
                <path d="M36 14C26 14 14 12 3 3M3 3l7 1M3 3l2 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {t("show.label")}
            </span>
            <span aria-hidden="true" className="bw-clip" />
            <div className="bw-browser" aria-hidden="true">
              <div className="bw-browser__top">
                <i />
                <i />
                <i />
                <span className="bw-browser__url">
                  <Lock /> aegisora.com
                </span>
              </div>
              <div className="bw-browser__nav">
                <ArrowLeft />
                <ArrowRight />
                <RotateCw />
                <span className="bw-browser__addr">
                  <Globe /> aegisora.com/docs/quickstart
                </span>
              </div>
              <div className="bw-browser__page">
                <div className="bw-ide">
                  <div className="bw-ide__tabs">
                    <span className="is-on">agent.ts</span>
                    <span>policy.json</span>
                  </div>
                  <pre className="bw-code">
                    <code>
                      <span className="c">{t("show.c1")}</span>
                      {"\n"}
                      {CODE_LINES.map(([c, tx], i) => (
                        <span key={i} className={c}>
                          {tx}
                        </span>
                      ))}
                      {"\n\n"}
                      <span className="k">switch</span>
                      {" (decision.verdict) {\n  "}
                      <span className="k">case</span> <span className="s">&quot;ALLOW&quot;</span>
                      {": "}
                      <span className="k">return</span>
                      {" runTool(action);\n  "}
                      <span className="k">case</span> <span className="s">&quot;ESCALATE&quot;</span>
                      {": "}
                      <span className="k">return</span>
                      {" queueForApproval(decision.id);\n  "}
                      <span className="k">default</span>
                      {": "}
                      <span className="c">{t("show.c2")}</span>
                      {"\n    "}
                      <span className="k">return</span>
                      {" stop(decision.reason);\n}"}
                    </code>
                  </pre>
                  <div className="bw-ide__result">
                    <Pill verdict="ESCALATE" />
                    <span>decision.id = dec_0002</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* in brief */}
      <section aria-label={t("brief.aria")} className="bw-sec bw-sec--stats">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-stats bw-stats--4">
            <div className="bw-stat bw-stat--brand">
              <BwMark size={34} />
              <div>
                <span>Aegisora</span>
                <b>{t("brief.tag")}</b>
              </div>
            </div>
            <Stat value="3" label={t("brief.l1")} />
            <Stat value="BLOCK" label={t("brief.l2")} />
            <Stat value="SHA-256" label={t("brief.l3")} />
          </div>
        </div>
      </section>

      {/* principle */}
      <BwSection className="bw-sec--soft">
        <div className="bw-quote bw-rv">
          <div className="bw-quote__tiles" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className={i === 4 ? "is-mid" : ""}>
                {i === 4 ? (
                  <>
                    <Shield />
                    <b>{t("principle.tile")}</b>
                  </>
                ) : null}
              </span>
            ))}
          </div>
          <div className="bw-quote__txt">
            <p>{t("principle.text")}</p>
            <div className="bw-quote__by">
              <span className="bw-avatars bw-avatars--sm">
                <span style={{ background: "#e7e6ff", color: "#3432ef" }}>
                  <ShieldCheck />
                </span>
              </span>
              <div>
                <b>{t("principle.by")}</b>
                <em>{t("principle.sub")}</em>
              </div>
            </div>
          </div>
        </div>
      </BwSection>

      {/* problem vs solution */}
      <BwSection id="problem">
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("problem.eyebrow")} title={two("problem")} intro={t("problem.intro")} />
        </div>
        <div className="bw-ps">
          <div className="bw-ps__col bw-rv">
            <ProblemChart />
            <h3>{t("problem.badTitle")}</h3>
            <p>{t("problem.badBody")}</p>
          </div>
          <div className="bw-ps__col bw-rv">
            <SolutionChart />
            <h3>{t("problem.goodTitle")}</h3>
            <p>{t("problem.goodBody")}</p>
          </div>
        </div>
      </BwSection>
      <BwHatch />

      {/* platform */}
      <BwSection id="platform" flush>
        <PlatformTabs />
      </BwSection>
      <BwHatch />
      <section aria-label={t("platform.aria")} className="bw-sec bw-sec--stats">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-stats bw-stats--4 bw-stats--white">
            <Stat value="4" label={t("platform.l1")} />
            <Stat value="3" label={t("platform.l2")} />
            <Stat value="1" label={t("platform.l3")} />
            <Stat value="SHA-256" label={t("platform.l4")} />
          </div>
        </div>
      </section>

      {/* reveal */}
      <section className="bw-sec bw-sec--blue">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-textpanel bw-grain">
            <Ball tone="dark" className="bw-textpanel__ball">
              <X />
            </Ball>
            <RevealText text={t("reveal")} />
            <Ball tone="green" className="bw-textpanel__ball2">
              <ShieldCheck />
            </Ball>
          </div>
        </div>
      </section>

      {/* how it works */}
      <BwSection id="how-it-works" flush>
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("how.eyebrow")} title={two("how")} intro={t("how.intro")} />
        </div>
        <HowTabs />
      </BwSection>
      <BwHatch />

      {/* decisions */}
      <BwSection id="decisions">
        <div className="bw-pad">
          <BwHead align="split" eyebrow={t("decisions.eyebrow")} title={two("decisions")} intro={t("decisions.intro")} />
        </div>
        <div className="bw-cols3 bw-cols3--phones">
          {decisions.map((c) => {
            const Ico = c.icon;
            return (
              <article key={c.id} className="bw-feat bw-feat--phone bw-rv">
                <PhoneVerdict sample={c.s} />
                <div className="bw-feat__txt">
                  <p className="bw-tagline">
                    <Ico aria-hidden="true" />
                    {t("decisions." + c.id + ".tag")}
                  </p>
                  <h3>{t("decisions." + c.id + ".title")}</h3>
                  <p>{t("decisions." + c.id + ".body")}</p>
                </div>
              </article>
            );
          })}
        </div>
      </BwSection>

      {/* compare */}
      <BwSection id="compare" flush>
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("compare.eyebrow")} title={two("compare")} intro={t("compare.intro")} />
        </div>
        <div className="bw-table-wrap bw-rv">
          <table className="bw-table">
            <thead>
              <tr>
                <th scope="col">{t("compare.head")}</th>
                {COMPARE_COLS.map((c, i) => (
                  <th key={c} scope="col" className={i === 0 ? "is-us" : ""}>
                    {i === 0 ? (
                      <span className="bw-table__brand">
                        <BwMark size={20} />
                        {c}
                      </span>
                    ) : (
                      t("compare.c" + i)
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, ri) => (
                <tr key={row.feature}>
                  <th scope="row">
                    <BwIcon name={row.icon} />
                    {t("compare.r" + ri)}
                  </th>
                  {row.cells.map((m, i) => (
                    <td key={i} className={i === 0 ? "is-us" : ""}>
                      <MarkCell v={m} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BwSection>
      <BwHatch />
      <section aria-label={t("compare.aria")} className="bw-sec bw-sec--stats">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-stats bw-stats--3 bw-stats--white">
            <Stat value={t("compare.v1")} label={t("compare.l1")} />
            <Stat value={t("compare.v2")} label={t("compare.l2")} />
            <Stat value={t("compare.v3")} label={t("compare.l3")} />
          </div>
        </div>
      </section>

      {/* benefits */}
      <BwSection id="benefits">
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("benefits.eyebrow")} title={two("benefits")} />
        </div>
        <div className="bw-grid2">
          {benefits.map((b) => {
            const Ico = b.icon;
            return (
              <article key={b.id} className="bw-feat bw-rv">
                {b.vis}
                <div className="bw-feat__txt">
                  <p className="bw-tagline">
                    <Ico aria-hidden="true" />
                    {t("benefits." + b.id + ".tag")}
                  </p>
                  <h3>{t("benefits." + b.id + ".title")}</h3>
                  <p>{t("benefits." + b.id + ".body")}</p>
                </div>
              </article>
            );
          })}
        </div>
      </BwSection>

      {/* integrations */}
      <section id="integrations" className="bw-sec bw-sec--blocks">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-pad bw-pad--head bw-blockhead">
            <BwHead eyebrow={t("tools.eyebrow")} title={two("tools")} intro={t("tools.intro")} />
          </div>
          <div className="bw-tiles">
            {TILES.map((tile) => {
              const Ico = tile.icon;
              return (
                <Link key={tile.action} href="/docs/quickstart" className="bw-tile">
                  <span className="bw-tile__ico">
                    <Ico aria-hidden="true" />
                  </span>
                  <span className="bw-tile__arrow">
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                  <b>{t("tiles." + tile.cat)}</b>
                  <code>{tile.action}</code>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <BwHatch />

      {/* evidence / growth */}
      <BwSection id="evidence" flush>
        <div className="bw-pad">
          <BwHead align="split" eyebrow={t("evidence.eyebrow")} title={two("evidence")} intro={t("evidence.intro")} />
        </div>
        <div className="bw-growthwrap">
          <div className="bw-growthcard">
            <p className="bw-growthcard__t">{t("evidence.cardTitle")}</p>
            <ul>
              <li>
                <i className="d-allow" /> ALLOW <em>{t("evidence.allowNote")}</em>
              </li>
              <li>
                <i className="d-esc" /> ESCALATE <em>{t("evidence.escNote")}</em>
              </li>
              <li>
                <i className="d-block" /> BLOCK <em>{t("evidence.blockNote")}</em>
              </li>
            </ul>
            <small>{t("evidence.fine")}</small>
          </div>
          <GrowthChart />
        </div>
      </BwSection>
      <BwHatch />

      {/* access (pricing layout) */}
      <BwSection id="access" flush>
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("access.eyebrow")} title={two("access")} intro={t("access.intro")} />
          <ul className="bw-incl" aria-label={t("access.inclAria")}>
            <li>{t("access.inclLead")}</li>
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <Check aria-hidden="true" /> {t("access.inc" + n)}
              </li>
            ))}
          </ul>
        </div>
        <div className="bw-stripe" aria-hidden="true" />
        <div className="bw-plans">
          {plans.map((p, n) => {
            const Ico = p.icon;
            return (
              <article key={p.id} className={"bw-plan" + (n === 1 ? " is-mid" : "")}>
                <div className="bw-plan__top">
                  <Ico aria-hidden="true" className="bw-plan__ico" />
                  {p.badge ? <span className="bw-plan__badge">{t("access.pilot.badge")}</span> : null}
                  <h3>{t("access." + p.id + ".name")}</h3>
                  <p>{t("access." + p.id + ".sub")}</p>
                  <p className="bw-plan__price">
                    <b>{t("access." + p.id + ".price")}</b>
                    <span>{t("access." + p.id + ".unit")}</span>
                  </p>
                  <BwBtn href={p.href} tone={p.tone} size="lg" className="bw-btn--block">
                    {t("access." + p.id + ".cta")}
                    <ArrowRight aria-hidden="true" />
                  </BwBtn>
                </div>
                <ul>
                  {[1, 2, 3, 4, 5].map((k) => (
                    <li key={k}>
                      <Check aria-hidden="true" />
                      {t("access." + p.id + ".i" + k)}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </BwSection>

      {/* CTA banner */}
      <section className="bw-sec bw-sec--blue">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-banner bw-grain">
            <Ball tone="blue" className="bw-banner__ball-l">
              <ShieldCheck />
            </Ball>
            <div>
              <h2>{t("banner.title")}</h2>
              <p>{t("banner.body")}</p>
            </div>
            <BwBtn href="/docs/quickstart" tone="white">
              {t("banner.cta")}
              <ArrowRight aria-hidden="true" />
            </BwBtn>
            <Ball tone="blue" className="bw-banner__ball-r">
              <Lock />
            </Ball>
          </div>
        </div>
      </section>

      {/* without borders */}
      <BwSection className="bw-sec--map">
        <div className="bw-borders">
          <div aria-hidden="true" className="bw-card3d bw-card3d--a bw-grain">
            <small>{t("borders.verdict")}</small>
            <b>ALLOW</b>
            <em>{t("borders.allow")}</em>
          </div>
          <div aria-hidden="true" className="bw-card3d bw-card3d--b bw-grain">
            <small>{t("borders.verdict")}</small>
            <b>ESCALATE</b>
            <em>{t("borders.esc")}</em>
          </div>
          <div aria-hidden="true" className="bw-card3d bw-card3d--c bw-grain">
            <small>{t("borders.verdict")}</small>
            <b>BLOCK</b>
            <em>{t("borders.block")}</em>
          </div>
          <div aria-hidden="true" className="bw-card3d bw-card3d--d bw-grain">
            <small>{t("borders.evidenceTag")}</small>
            <b>SHA-256</b>
            <em>{t("borders.hash")}</em>
          </div>
          <div className="bw-borders__txt bw-rv">
            <h2 className="bw-h2">{two("borders")}</h2>
            <p className="bw-lead">{t("borders.lead")}</p>
            <BwBtn href="/signup" tone="dark">
              {t("borders.cta")}
              <ArrowRight aria-hidden="true" />
            </BwBtn>
          </div>
        </div>
        <div className="bw-flags">
          <Marquee
            items={ACTIONS}
            label=""
            render={(a, i) => (
              <span key={a + i} className="bw-flag">
                <i />
                {a}
              </span>
            )}
          />
        </div>
      </BwSection>

      {/* docs */}
      <BwSection flush>
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("docs.eyebrow")} title={t("docs.title")} />
        </div>
        <div className="bw-docs">
          {DOCS.map((d) => (
            <article key={d.id} className="bw-doc bw-rv">
              <Link href={d.href} className="bw-doc__img bw-grain">
                <BwMark size={34} />
                <small>{t("docs." + d.id + ".tag")}</small>
                <b>{t("docs." + d.id + ".title")}</b>
              </Link>
              <div className="bw-doc__body">
                <p className="bw-doc__meta">
                  <span>{t("docs." + d.id + ".meta")}</span>
                  <span>{t("docs.by")}</span>
                </p>
                <h3>{t("docs." + d.id + ".title")}</h3>
                <p>{t("docs." + d.id + ".desc")}</p>
                <BwBtn href={d.href} tone="light" size="sm">
                  {t("docs.more")}
                  <ArrowRight aria-hidden="true" />
                </BwBtn>
              </div>
            </article>
          ))}
        </div>
        <div className="bw-center">
          <BwBtn href="/docs/technical" tone="light" size="sm">
            {t("docs.all")}
          </BwBtn>
        </div>
      </BwSection>

      {/* scenarios */}
      <BwSection flush className="bw-sec--soft">
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("scenarios.eyebrow")} title={t("scenarios.title")} intro={t("scenarios.intro")} />
        </div>
        <div className="bw-reviews">
          <div className="bw-reviews__track">
            {SCENARIOS.concat(SCENARIOS).map((s, i) => {
              const k = i % SCENARIOS.length;
              const tag = t("scenarios.t" + k);
              return (
                <article key={i} className="bw-review" aria-hidden={i >= SCENARIOS.length ? "true" : undefined}>
                  <Quote aria-hidden="true" className="bw-review__q" />
                  <p>{t("scenarios.q" + k)}</p>
                  <div className="bw-review__by">
                    <span className="bw-avatars bw-avatars--sm">
                      <span style={{ background: "#e7e6ff", color: "#3432ef" }}>{tag.slice(0, 2).toUpperCase()}</span>
                    </span>
                    <div>
                      <b>{tag}</b>
                      <em>{t("scenarios.note")}</em>
                    </div>
                    <Pill verdict={s.verdict} className="bw-pill--xs" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </BwSection>

      {/* faq */}
      <BwSection id="faq" flush>
        <div className="bw-pad bw-pad--head">
          <BwHead eyebrow={t("faq.eyebrow")} title={t("faq.title")} intro={t("faq.intro")} />
        </div>
        <div className="bw-pad bw-pad--faq">
          <FaqList />
        </div>
      </BwSection>

      {/* final CTA */}
      <section className="bw-sec bw-sec--final">
        <div className="bw-wrap bw-wrap--flush">
          <div className="bw-final bw-grain">
            <span aria-hidden="true" className="bw-pclip bw-pclip--l" />
            <span aria-hidden="true" className="bw-pclip bw-pclip--r" />
            <span className="bw-final__logo">
              <BwMark size={30} />
            </span>
            <p className="bw-final__tag">{t("final.tag")}</p>
            <h2>{t("final.title")}</h2>
            <p>{t("final.body")}</p>
            <div className="bw-final__cta">
              <Link href="/pilot" className="bw-btn bw-btn--outline bw-btn--md">
                {t("final.apply")}
              </Link>
              <BwBtn href="/signup" tone="white" size="md">
                {t("final.test")}
                <ArrowRight aria-hidden="true" />
              </BwBtn>
            </div>
            <Ball tone="green" className="bw-final__ball-l">
              <ShieldCheck />
            </Ball>
            <Ball tone="blue" className="bw-final__ball-r">
              <Lock />
            </Ball>
            <div aria-hidden="true" className="bw-final__pix" />
          </div>
        </div>
      </section>
    </div>
  );
}