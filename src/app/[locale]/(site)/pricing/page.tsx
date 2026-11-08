import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PricingTiers } from "@/components/aegx/pricing-tiers";
import { meta } from "@/lib/seo";
import { Btn, Cell, Cells, Cta, Hero, Sec, SectionHead } from "@/components/aegx/ui";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return meta(t("metaTitle"), t("metaDesc"));
}

type Plan = {
  name: string;
  badge: string | null;
  price: string;
  sub: string;
  blurb: string;
  meta: [string, string][];
  cta: { label: string; href: string };
  more: { label: string; href: string };
  featured: boolean;
};

const GROUP_DEF: { key: string; rows: [string, string, string, string][] }[] = [
  { key: "g1", rows: [["r1", "yes", "yes", "planned"], ["r2", "yes", "yes", "planned"], ["r3", "yes", "yes", "planned"]] },
  { key: "g2", rows: [["r4", "yes", "yes", "planned"], ["r5", "yes", "yes", "planned"], ["r6", "no", "planned", "planned"]] },
  { key: "g3", rows: [["r7", "yes", "yes", "planned"], ["r8", "yes", "yes", "planned"], ["r9", "notClaimed", "notClaimed", "planned"]] },
  { key: "g4", rows: [["r10", "no", "no", "no"], ["r11", "no", "no", "no"], ["r12", "no", "yes", "planned"], ["r13", "no", "yes", "planned"]] },
];

type CellLabels = { included: string; notOffered: string; planned: string; notClaimed: string };

function CellView({ v, L }: { v: string; L: CellLabels }) {
  if (v === "yes") return <Check className="aegx-yes" aria-label={L.included} />;
  if (v === "no") return <Minus className="aegx-no" aria-label={L.notOffered} />;
  return <span className="aegx-soft">{v === "planned" ? L.planned : v === "notClaimed" ? L.notClaimed : v}</span>;
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");
  const de = locale === "de";

  const L: CellLabels = {
    included: t("cell.included"),
    notOffered: t("cell.notOffered"),
    planned: t("cell.planned"),
    notClaimed: t("cell.notClaimed"),
  };

  const mk = (k: string, badge: string | null, ctaHref: string, moreHref: string, featured: boolean): Plan => ({
    name: t(`plans.${k}.name`),
    badge,
    price: t(`plans.${k}.price`),
    sub: t(`plans.${k}.sub`),
    blurb: t(`plans.${k}.blurb`),
    meta: [
      [t(`plans.${k}.k1`), t(`plans.${k}.v1`)],
      [t(`plans.${k}.k2`), t(`plans.${k}.v2`)],
      [t(`plans.${k}.k3`), t(`plans.${k}.v3`)],
    ],
    cta: { label: t(`plans.${k}.cta`), href: ctaHref },
    more: { label: t(`plans.${k}.more`), href: moreHref },
    featured,
  });

  const PLANS: Plan[] = [
    mk("test", null, "/signup", "/docs/quickstart", false),
    mk("pilot", t("badgeRecommended"), "/enterprise", "/docs", true),
    mk("prod", t("badgePlanned"), "/pilot", "/trust", false),
  ];

  const SCOPE = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => t(k));
  const FAQ: [string, string][] = ["1", "2", "3", "4", "5"].map((n) => [t("q" + n), t("a" + n)]);

  return (
    <>
      <Hero
        compact
        badge={t("heroEyebrow")}
        title={t("heroTitle")}
        intro={t("heroIntro")}
        primary={{ label: t("primary"), href: "/signup" }}
        secondary={{ label: t("secondary"), href: "/enterprise" }}
      />

      <Sec flush>
        <PricingTiers de={de} />

        <div className="aegx-band">
          <div>
            <h3 className="aegx-h3">{t("commTitle")}</h3>
            <p className="aegx-p">{t("commP1")}</p>
            <p className="aegx-p">{t("commP2")}</p>
          </div>
          <div className="aegx-band__act">
            <Btn href="/enterprise">{t("commBtn1")}</Btn>
            <Btn href="/docs" variant="soft">{t("commBtn2")}</Btn>
          </div>
        </div>
      </Sec>

      <Sec flush>
        <div className="aegx-pad aegx-pad--head">
          <SectionHead title={t("scopeTitle")} />
        </div>
        <Cells n={4}>
          {SCOPE.map((s, i) => (
            <Cell key={i} num={String(i + 1).padStart(2, "0")} title={s}>{t("agreed")}</Cell>
          ))}
        </Cells>
      </Sec>

      <Sec>
        <SectionHead title={t("compareTitle")} intro={t("compareIntro")} />
        <div className="aegx-tablewrap">
          <table className="aegx-table">
            <thead>
              <tr>
                <th />
                {PLANS.map((p) => (<th key={p.name}>{p.name}</th>))}
              </tr>
            </thead>
            {GROUP_DEF.map((g) => (
              <tbody key={g.key}>
                <tr className="aegx-table__group"><th colSpan={4}>{t("groups." + g.key)}</th></tr>
                {g.rows.map((r) => (
                  <tr key={r[0]}>
                    <th scope="row">{t("rows." + r[0])}</th>
                    <td><CellView v={r[1]} L={L} /></td>
                    <td><CellView v={r[2]} L={L} /></td>
                    <td><CellView v={r[3]} L={L} /></td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Sec>

      <Sec>
        <SectionHead title={t("faqTitle")} />
        <div className="aegx-faq" style={{ marginTop: 40 }}>
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span aria-hidden="true">+</span></summary>
              <p>{a}</p>
            </details>
          ))}
          <p className="aegx-faq__foot">
            {t("faqLead")} <Link href="/pilot">{t("faqLink")}</Link> {t("faqTail")}
          </p>
        </div>
      </Sec>

      <Cta
        title={de ? "Starte mit einem kostenlosen Workspace." : "Start with a free workspace."}
        body={de ? "Verbinde einen Agenten und sende deine erste Testaktion. Upgrade, wenn du bereit bist." : "Connect an agent and send your first test action. Upgrade when you are ready."}
        primary={{ label: de ? "Kostenlos starten" : "Start for free", href: "/signup" }}
        secondary={{ label: de ? "Mit uns sprechen" : "Talk to us", href: "/enterprise" }}
      />
    </>
  );
}