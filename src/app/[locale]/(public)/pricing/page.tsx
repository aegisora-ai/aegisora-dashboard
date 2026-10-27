import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, ChevronDown, Minus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { meta } from "@/lib/seo";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/aegisora/page-kit";

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
  if (v === "yes") return <Check className="mx-auto size-5 text-emerald-400" aria-label={L.included} />;
  if (v === "no") return <Minus className="mx-auto size-5 text-foreground/30" aria-label={L.notOffered} />;
  return <span className="text-xs font-medium text-foreground/60">{v === "planned" ? L.planned : v === "notClaimed" ? L.notClaimed : v}</span>;
}

const COLS = "grid grid-cols-[1.7fr_1fr_1fr_1fr] items-center gap-2";

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

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
      <PageHero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        intro={t("heroIntro")}
        primary={{ label: t("primary"), href: "/signup" }}
        secondary={{ label: t("secondary"), href: "/enterprise" }}
        rows={[
          { action: "workspace.create test", meta: t("heroRow1"), v: "ALLOW" },
          { action: "pilot.start scoped", meta: t("heroRow2"), v: "ESCALATE" },
          { action: "billing.self_serve", meta: t("heroRow3"), v: "BLOCK" },
        ]}
      />

      <Section eyebrow={t("plansEyebrow")} title={t("plansTitle")} tone="alt">
        <div className="grid gap-4 pt-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={
                "relative flex flex-col rounded-2xl border p-6 md:p-7 " +
                (p.featured ? "border-primary/60 bg-surface-3" : "border-border bg-surface-1")
              }
            >
              {p.badge ? (
                <span
                  className={
                    "absolute -top-3 right-6 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide " +
                    (p.featured ? "bg-primary text-primary-foreground" : "bg-surface-3 text-foreground/80")
                  }
                >
                  {p.badge.toUpperCase()}
                </span>
              ) : null}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-4 text-4xl font-medium tracking-[-0.02em]">{p.price}</p>
              <p className="mt-1 text-xs font-medium text-primary">{p.sub}</p>
              <p className="mt-4 min-h-[3.5rem] text-sm leading-relaxed text-foreground/70">{p.blurb}</p>
              <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
                {p.meta.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] font-semibold tracking-wider text-foreground/50">{k}</dt>
                    <dd className="mt-1 text-xs font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={p.cta.href}
                className={
                  "mt-6 inline-flex h-11 items-center justify-center rounded-md text-sm font-semibold transition " +
                  (p.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "border border-border text-foreground hover:bg-surface-3")
                }
              >
                {p.cta.label}
              </Link>
              <Link href={p.more.href} className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover">
                {p.more.label} <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-surface-1 p-6 md:p-8">
          <div className="max-w-3xl">
            <h3 className="text-xl font-semibold">{t("commTitle")}</h3>
            <p className="mt-3 text-sm leading-6 text-foreground/70">{t("commP1")}</p>
            <p className="mt-3 text-sm leading-6 text-foreground/70">{t("commP2")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/enterprise" className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              {t("commBtn1")}
            </Link>
            <Link href="/docs" className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-foreground hover:bg-surface-3">
              {t("commBtn2")}
            </Link>
          </div>
        </div>
      </Section>

      <Section title={t("scopeTitle")}>
        <CardGrid
          cols={4}
          items={SCOPE.map((s, i) => ({ n: String(i + 1).padStart(2, "0"), title: s, body: t("agreed") }))}
        />
      </Section>

      <Section title={t("compareTitle")} intro={t("compareIntro")} tone="alt">
        <div className="space-y-3 md:hidden">
          {GROUP_DEF.map((g, gi) => (
            <details key={g.key} open={gi === 0} className="group rounded-xl border border-border bg-surface-1">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {t("groups." + g.key)}
                <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="divide-y divide-border border-t border-border">
                {g.rows.map((r) => (
                  <div key={r[0]} className="px-4 py-3">
                    <p className="text-sm font-medium">{t("rows." + r[0])}</p>
                    <dl className="mt-2 space-y-1.5">
                      {PLANS.map((p, pi) => (
                        <div key={p.name} className="flex items-center justify-between gap-3 text-xs">
                          <dt className="text-foreground/60">{p.name}</dt>
                          <dd><CellView v={r[pi + 1]} L={L} /></dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[680px]">
            <div className={COLS + " pb-4"}>
              <span />
              {PLANS.map((p) => (
                <span key={p.name} className="text-center text-sm font-semibold">{p.name}</span>
              ))}
            </div>
            {GROUP_DEF.map((g, gi) => (
              <details key={g.key} open={gi === 0} className="group border-t-2 border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {t("groups." + g.key)}
                  <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-3">
                  {g.rows.map((r) => (
                    <div key={r[0]} className={COLS + " border-t border-border py-3 text-sm"}>
                      <span className="font-medium">{t("rows." + r[0])}</span>
                      <span className="text-center"><CellView v={r[1]} L={L} /></span>
                      <span className="text-center"><CellView v={r[2]} L={L} /></span>
                      <span className="text-center"><CellView v={r[3]} L={L} /></span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
            <div className="border-t-2 border-border" />
          </div>
        </div>
      </Section>

      <Section title={t("faqTitle")}>
        <div className="max-w-4xl">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-t border-border last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-2xl font-light leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-foreground/70">{a}</p>
            </details>
          ))}
          <p className="mt-8 text-sm text-foreground/70">
            {t("faqLead")}{" "}
            <Link href="/pilot" className="font-semibold text-primary underline underline-offset-4">{t("faqLink")}</Link>{" "}
            {t("faqTail")}
          </p>
        </div>
      </Section>

      <CtaBand
        title={t("ctaTitle")}
        body={t("ctaBody")}
        primary={{ label: t("primary"), href: "/signup" }}
        secondary={{ label: t("secondary"), href: "/enterprise" }}
      />
    </>
  );
}