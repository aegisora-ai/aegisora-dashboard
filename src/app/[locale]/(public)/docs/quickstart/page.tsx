import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock, Steps } from "@/components/aegisora/page-kit";
import { meta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DocsQuick" });
  return meta(t("metaTitle"), t("metaDesc"));
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://YOUR-AEGISORA-HOST";

const curlExample = `curl -s -X POST ${BASE}/api/v1/evaluate \\
  -H "Authorization: Bearer $AEGISORA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agent":"finance-operator","action":"invoice.read","resource":"invoice:sample-001","risk":20}'`;

const responseExample = `{
  "decision_id": "...",
  "effect": "BLOCK",
  "reason": "...",
  "policy_id": null,
  "approval_id": null,
  "execution_id": null,
  "trace_id": "...",
  "evidence_hash": "...",
  "agent_registered": true
}`;

const nodeExample = `import { Aegisora } from "./aegisora.mjs";

const aegisora = new Aegisora({ baseUrl: process.env.AEGISORA_BASE_URL });

// The callback runs only when the decision is ALLOW.
// BLOCK and ESCALATE throw AegisoraDecisionError.
const result = await aegisora.guard(
  { agent: "finance-operator", action: "invoice.read", resource: "invoice:sample-001", risk: 20 },
  async (decision) => doTransfer(decision.decision_id)
);`;

export default async function QuickstartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DocsQuick");

  return (
    <div>
      <h1 className="text-4xl font-light tracking-tight">{t("h1")}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("lead")}</p>

      <h2 id="access" className="mt-12 scroll-mt-24 text-2xl font-medium">{t("accessTitle")}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{t("accessP")}</p>

      <h2 id="request" className="mt-16 scroll-mt-24 text-2xl font-medium">{t("sendTitle")}</h2>
      <div className="mt-6">
        <CodeBlock code={curlExample} />
      </div>

      <h2 id="decision" className="mt-16 scroll-mt-24 text-2xl font-medium">{t("decisionTitle")}</h2>
      <div className="mt-6">
        <CodeBlock code={responseExample} />
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("decisionP")}</p>

      <h2 id="sdk" className="mt-16 scroll-mt-24 text-2xl font-medium">{t("sdkTitle")}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        <a
          href="/sdk/aegisora.mjs"
          download
          className="font-semibold text-primary underline underline-offset-4"
        >
          {t("sdkLink")}
        </a>
        {t("sdkTail")}
      </p>
      <div className="mt-6">
        <CodeBlock code={nodeExample} />
      </div>

      <h2 className="mt-16 text-2xl font-medium">{t("expectTitle")}</h2>
      <div className="mt-6">
        <Steps
          cols={3}
          items={[
            [t("s1t"), t("s1b")],
            [t("s2t"), t("s2b")],
            [t("s3t"), t("s3b")],
          ]}
        />
      </div>
    </div>
  );
}