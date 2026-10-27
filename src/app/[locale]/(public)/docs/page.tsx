import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock, DataTable, Eyebrow, Steps } from "@/components/aegisora/page-kit";
import { V1Canvas, V2Canvas, V3Canvas } from "@/components/aegisora/version-canvas";
import { meta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DocsIntro" });
  return meta(t("metaTitle"), t("metaDesc"));
}

const BADGE = "rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground";

const VERS = [
  { id: "v1", n: 4, Canvas: V1Canvas, top: "mt-14", panel: "", badge: BADGE },
  { id: "v2", n: 4, Canvas: V2Canvas, top: "mt-8", panel: "", badge: BADGE },
  { id: "v3", n: 6, Canvas: V3Canvas, top: "mt-8", panel: "", badge: BADGE + " font-semibold" },
  {
    id: "v4",
    n: 6,
    Canvas: null,
    top: "mt-8",
    panel: " border-primary/30",
    badge: "rounded-full border border-allow bg-allow-muted px-3 py-1 font-mono text-[11px] font-semibold text-allow",
  },
];

const ROWS: string[][] = [
  ["r1", "yes", "yes", "yes", "yes"],
  ["r2", "dash", "yes", "yes", "yes"],
  ["r3", "dash", "yes", "callerRisk", "unchanged"],
  ["r4", "allowDeny", "abb", "abb", "abb"],
  ["r5", "dash", "advisory", "decisionApi", "unchanged"],
  ["r6", "dash", "nonDurable", "durable", "durable"],
  ["r7", "dash", "dash", "yes", "yes"],
  ["r8", "dash", "dash", "yes", "yes"],
  ["r9", "dash", "dash", "dash", "yes"],
  ["r10", "dash", "dash", "dash", "yes"],
  ["r11", "dash", "dash", "dash", "yes"],
];

const POLICY_CODE = `agent:       finance-operator
action:      external_transfer
environment: production
threshold:   elevated
decision:    ESCALATE`;

const API_CODE = `curl -X POST https://aegisora.org/api/v1/evaluate \\
  -H "Authorization: Bearer aeg_live_<your-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "customer-support-bot",
    "action": "stripe_refund_api",
    "resource": "invoice/INV-1042",
    "risk": 40,
    "input": { "amount_usd": 480 }
  }'

# 200 response
{
  "decision_id": "<uuid>",
  "effect": "ESCALATE",
  "reason": "<text>",
  "policy_id": "<uuid or null>",
  "approval_id": "<uuid or null>",
  "execution_id": null,
  "trace_id": "<id>",
  "evidence_hash": "<hash>",
  "agent_registered": false
}`;

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DocsIntro");

  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">{t("h1")}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("lead")}</p>

      <h2 id="why" className="mt-12 scroll-mt-24 text-2xl font-medium">{t("whyTitle")}</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">{t("whyP")}</p>
      <div id="example" className="mt-8 scroll-mt-24">
        <CodeBlock code={POLICY_CODE} caption={t("exampleCaption")} />
      </div>

      <h2 className="mt-20 text-2xl font-medium">{t("verTitle")}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{t("verP")}</p>

      {VERS.map((v) => (
        <div key={v.id} id={v.id} className={v.top + " scroll-mt-24 aeg-panel p-6 md:p-8" + v.panel}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <Eyebrow accent>{t(v.id + ".eyebrow")}</Eyebrow>
              <h3 className="mt-2 text-xl font-medium">{t(v.id + ".title")}</h3>
            </div>
            <span className={v.badge}>{t(v.id + ".badge")}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t(v.id + ".p")}</p>
          {v.Canvas ? (
            <div className="mt-6 overflow-x-auto"><v.Canvas /></div>
          ) : null}
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {Array.from({ length: v.n }, (_, i) => (
              <li key={i}>&bull; {t(v.id + ".b" + (i + 1))}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2 id="capability" className="mt-20 scroll-mt-24 text-2xl font-medium">{t("capTitle")}</h2>
      <div className="mt-6">
        <DataTable
          head={[t("capHead"), "1.0", "2.0", "3.0", "4.0"]}
          rows={ROWS.map(([k, ...cells]) => [t("rows." + k), ...cells.map((c) => t("cell." + c))])}
        />
      </div>

      <h2 className="mt-20 text-2xl font-medium">{t("conceptsTitle")}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{t("conceptsLead")}</p>
      <div className="mt-8">
        <Steps
          cols={4}
          items={[
            [t("c1t"), t("c1b")],
            [t("c2t"), t("c2b")],
            [t("c3t"), t("c3b")],
            [t("c4t"), t("c4b")],
          ]}
        />
      </div>

      <h2 id="api" className="mt-20 scroll-mt-24 text-2xl font-medium">{t("apiTitle")}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{t("apiLead")}</p>
      <div className="mt-8">
        <CodeBlock code={API_CODE} caption={t("apiCaption")} />
      </div>

      <p className="mt-10 text-sm text-muted-foreground">{t("footer")}</p>
    </div>
  );
}